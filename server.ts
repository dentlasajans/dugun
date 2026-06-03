import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Use memory storage for smallish uploads, or disk storage if needed.
  // For larger video files, memory storage can crash the node process. Disk storage is better.
  const upload = multer({ dest: os.tmpdir() });

  app.get("/api/test-key", (req, res) => {
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const formattedKey = formatPrivateKey(rawKey);
    res.json({
      rawHasLiteralNewline: rawKey.includes('\\n'),
      rawHasRealNewline: rawKey.includes('\n'),
      formattedHasLiteralNewline: formattedKey.includes('\\n'),
      formattedHasRealNewline: formattedKey.includes('\n'),
      rawStart: rawKey.substring(0, 40),
      rawEnd: rawKey.substring(rawKey.length - 40),
      formattedStart: formattedKey.substring(0, 40),
      formattedEnd: formattedKey.substring(formattedKey.length - 40),
    });
  });

  app.get("/api/get-s3-presigned-url", async (req, res) => {
    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      const fileName = req.query.fileName as string;
      const fileType = req.query.fileType as string;
      if (!fileName || !fileType) return res.status(400).json({ error: "fileName and fileType required" });

      const endpoint = process.env.S3_ENDPOINT || '';
      const region = process.env.S3_REGION || 'auto';
      const accessKeyId = process.env.S3_ACCESS_KEY_ID || '';
      const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';
      const bucket = process.env.S3_BUCKET_NAME || '';
      const publicDomain = process.env.S3_PUBLIC_DOMAIN || '';

      if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
        return res.status(500).json({ error: "S3 ayarları yapılandırılmamış. Sunucuya S3 bilgileri eklenmelidir." });
      }

      const client = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const key = `weddings/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: fileType,
      });

      const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
      let publicUrl = publicDomain ? (publicDomain.startsWith('http') ? `${publicDomain}/${key}` : `https://${publicDomain}/${key}`) : `${endpoint}/${bucket}/${key}`;

      res.json({
        uploadUrl: presignedUrl,
        publicUrl: publicUrl,
        publicId: key
      });

    } catch (e: any) {
      console.error("S3 Presigner error:", e);
      res.status(500).json({ error: "S3 URL oluşturulamadı: " + e.message });
    }
  });




  app.get("/api/proxy-download", (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("URL is required");
    
    // We can use https or http to proxy the file
    // Doing it this way streams it and doesn't load whole file in memory
    const client = url.startsWith('https') ? require('https') : require('http');
    client.get(url, (proxyRes: any) => {
      // res.status(proxyRes.statusCode || 200);
      
      // Sadece güvenli header'ları geçir, CORS'u kapat
      if (proxyRes.statusCode) res.status(proxyRes.statusCode);
      
      const contentType = proxyRes.headers['content-type'];
      if (contentType) res.setHeader('Content-Type', contentType);
      
      const contentLength = proxyRes.headers['content-length'];
      if (contentLength) res.setHeader('Content-Length', contentLength);

      if (req.query.filename) {
         res.setHeader('Content-Disposition', `attachment; filename="${req.query.filename}"`);
      }

      proxyRes.pipe(res);
    }).on('error', (err: any) => {
      res.status(500).send(err.message);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
