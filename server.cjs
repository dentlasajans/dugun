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
var import_googleapis = require("googleapis");
var import_url = require("url");
var import_fs = __toESM(require("fs"), 1);
var import_os = __toESM(require("os"), 1);
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  const upload = (0, import_multer.default)({ dest: import_os.default.tmpdir() });
  app.get("/api/get-drive-token", async (req, res) => {
    try {
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;
      if (!clientEmail || !privateKey) {
        return res.status(500).json({ error: "Google Drive servis hesab\u0131 bulunamad\u0131." });
      }
      privateKey = privateKey.replace(/\\n/g, "\n");
      if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        privateKey = "-----BEGIN PRIVATE KEY-----\n" + privateKey.trim();
      }
      if (!privateKey.includes("-----END PRIVATE KEY-----")) {
        privateKey = privateKey.trim() + "\n-----END PRIVATE KEY-----\n";
      }
      const auth = new import_googleapis.google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.metadata"]
      });
      const tokenObj = await auth.getAccessToken();
      if (!tokenObj.token) {
        return res.status(500).json({ error: "Token al\u0131namad\u0131." });
      }
      res.json({
        token: tokenObj.token,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID
      });
    } catch (err) {
      console.error("Token Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate token" });
    }
  });
  app.post("/api/upload-video", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: "Dosya y\xFCkleme hatas\u0131: " + err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      if (!clientEmail || !privateKey) {
        return res.status(500).json({ error: "Google Drive kimlik bilgileri yap\u0131land\u0131r\u0131lmad\u0131 (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)." });
      }
      const auth = new import_googleapis.google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey
        },
        scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]
      });
      const drive = import_googleapis.google.drive({ version: "v3", auth });
      const fileMetadata = {
        name: req.body.name || `Upload-${Date.now()}-${file.originalname}`
      };
      if (folderId) {
        fileMetadata.parents = [folderId];
      }
      const media = {
        mimeType: file.mimetype,
        body: import_fs.default.createReadStream(file.path)
      };
      console.log("Uploading file to Google Drive...");
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, webViewLink, webContentLink, thumbnailLink"
      });
      const fileId = response.data.id;
      import_fs.default.unlink(file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
      if (fileId) {
        console.log("File uploaded, setting permissions...");
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: "reader",
            type: "anyone"
          }
        });
      }
      res.json({
        id: fileId,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        thumbnailLink: response.data.thumbnailLink
      });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: error.message || "Failed to upload video" });
    }
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
