var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_multer = __toESM(require("multer"), 1);
var import_url = require("url");
var import_os = __toESM(require("os"), 1);
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  const upload = (0, import_multer.default)({ dest: import_os.default.tmpdir() });
  app.get("/api/test-key", (req, res) => {
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
    const formattedKey = formatPrivateKey(rawKey);
    res.json({
      rawHasLiteralNewline: rawKey.includes("\\n"),
      rawHasRealNewline: rawKey.includes("\n"),
      formattedHasLiteralNewline: formattedKey.includes("\\n"),
      formattedHasRealNewline: formattedKey.includes("\n"),
      rawStart: rawKey.substring(0, 40),
      rawEnd: rawKey.substring(rawKey.length - 40),
      formattedStart: formattedKey.substring(0, 40),
      formattedEnd: formattedKey.substring(formattedKey.length - 40)
    });
  });
  app.get("/api/get-s3-presigned-url", async (req, res) => {
    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const fileName = req.query.fileName;
      const fileType = req.query.fileType;
      if (!fileName || !fileType) return res.status(400).json({ error: "fileName and fileType required" });
      const endpoint = process.env.S3_ENDPOINT || "";
      const region = process.env.S3_REGION || "auto";
      const accessKeyId = process.env.S3_ACCESS_KEY_ID || "";
      const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";
      const bucket = process.env.S3_BUCKET_NAME || "";
      const publicDomain = process.env.S3_PUBLIC_DOMAIN || "";
      if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
        return res.status(500).json({ error: "S3 ayarlar\u0131 yap\u0131land\u0131r\u0131lmam\u0131\u015F. Sunucuya S3 bilgileri eklenmelidir." });
      }
      const client = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      });
      const key = `weddings/${Date.now()}-${fileName.replace(/\s+/g, "-")}`;
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: fileType
      });
      const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
      let publicUrl = publicDomain ? publicDomain.startsWith("http") ? `${publicDomain}/${key}` : `https://${publicDomain}/${key}` : `${endpoint}/${bucket}/${key}`;
      res.json({
        uploadUrl: presignedUrl,
        publicUrl,
        publicId: key
      });
    } catch (e) {
      console.error("S3 Presigner error:", e);
      res.status(500).json({ error: "S3 URL olu\u015Fturulamad\u0131: " + e.message });
    }
  });
  app.get("/api/proxy-download", (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send("URL is required");
    const client = url.startsWith("https") ? require("https") : require("http");
    client.get(url, (proxyRes) => {
      if (proxyRes.statusCode) res.status(proxyRes.statusCode);
      const contentType = proxyRes.headers["content-type"];
      if (contentType) res.setHeader("Content-Type", contentType);
      const contentLength = proxyRes.headers["content-length"];
      if (contentLength) res.setHeader("Content-Length", contentLength);
      if (req.query.filename) {
        res.setHeader("Content-Disposition", `attachment; filename="${req.query.filename}"`);
      }
      proxyRes.pipe(res);
    }).on("error", (err) => {
      res.status(500).send(err.message);
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer().catch(console.error);
//# sourceMappingURL=server.cjs.map
