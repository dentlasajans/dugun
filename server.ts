import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { google } from "googleapis";
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

  app.get("/api/get-drive-token", async (req, res) => {
    try {
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;
      
      if (!clientEmail || !privateKey) {
        return res.status(500).json({ error: "Google Drive servis hesabı bulunamadı." });
      }
      
      // Fix multiline key formats
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
         // Some environments pass the private key without newlines or incorrectly formatted spaces
         // Or they literally pass '\n' characters.
         privateKey = privateKey.replace(/\\n/g, '\n');
      }

      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata']
      });

      const tokenObj = await auth.getAccessToken();
      
      if (!tokenObj.token) {
         return res.status(500).json({ error: "Token alınamadı." });
      }

      res.json({ 
         token: tokenObj.token,
         folderId: process.env.GOOGLE_DRIVE_FOLDER_ID
      });
    } catch (err: any) {
      console.error("Token Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate token" });
    }
  });

  // API route for uploading video to Google Drive (Fallback / Legacy)
  app.post("/api/upload-video", (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: "Dosya yükleme hatası: " + err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Check credentials
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      if (!clientEmail || !privateKey) {
        return res.status(500).json({ error: "Google Drive kimlik bilgileri yapılandırılmadı (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)." });
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
      });

      const drive = google.drive({ version: 'v3', auth });

      const fileMetadata: any = {
        name: req.body.name || `Upload-${Date.now()}-${file.originalname}`,
      };
      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path)
      };

      console.log("Uploading file to Google Drive...");
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink, thumbnailLink'
      });
      
      const fileId = response.data.id;
      
      // Clean up temp file
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });

      if (fileId) {
        console.log("File uploaded, setting permissions...");
        // Set permissions so anyone with the link can view
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          }
        });
      }

      res.json({
        id: fileId,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        thumbnailLink: response.data.thumbnailLink
      });

    } catch (error: any) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: error.message || "Failed to upload video" });
    }
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
