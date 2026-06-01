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
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_cloudinary = require("cloudinary");
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_firebase_admin = __toESM(require("firebase-admin"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((0, import_cors.default)());
app.use(import_express.default.json());
import_cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
var storage = import_multer.default.memoryStorage();
var upload = (0, import_multer.default)({ storage });
var dataFile = import_path.default.join(process.cwd(), "weddings.json");
var weddings = [];
var loadWeddings = () => {
  if (import_fs.default.existsSync(dataFile)) {
    try {
      weddings = JSON.parse(import_fs.default.readFileSync(dataFile, "utf8"));
    } catch (e) {
      console.error("Error reading weddings.json", e);
    }
  }
  if (weddings.length === 0) {
    weddings = [{
      id: "demo",
      linkName: "demo",
      brideName: "Elif",
      groomName: "Can",
      text1: "Hikayemiz Ba\u015Fl\u0131yor...",
      text2: "Masals\u0131 an\u0131lar\u0131m\u0131za ve en mutlu g\xFCn\xFCm\xFCze ortak oldu\u011Funuz i\xE7in sonsuz te\u015Fekk\xFCrler."
    }];
  }
};
var saveWeddings = () => {
  import_fs.default.writeFileSync(dataFile, JSON.stringify(weddings, null, 2));
};
loadWeddings();
import_firebase_admin.default.initializeApp({
  projectId: "atlaspos-8e4a9"
});
var authenticateAdmin = async (req, res, next) => {
  const token = req.headers["authorization"]?.split("Bearer ")[1] || req.headers["x-admin-pin"];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Missing token." });
  }
  try {
    const decodedToken = await import_firebase_admin.default.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }
};
app.post("/api/auth", async (req, res) => {
  const { pin } = req.body;
  try {
    if (!pin) throw new Error("No token");
    await import_firebase_admin.default.auth().verifyIdToken(pin);
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});
app.get("/api/weddings", authenticateAdmin, (req, res) => {
  res.json(weddings);
});
app.post("/api/weddings", authenticateAdmin, (req, res) => {
  const newWedding = {
    id: Date.now().toString(),
    linkName: req.body.linkName || `dugun-${Date.now()}`,
    brideName: req.body.brideName || "Gelin",
    groomName: req.body.groomName || "Damat",
    text1: req.body.text1 || "Hikayemiz Ba\u015Fl\u0131yor...",
    text2: req.body.text2 || "Mutlu g\xFCn\xFCm\xFCze ortak oldu\u011Funuz i\xE7in te\u015Fekk\xFCrler."
  };
  weddings.push(newWedding);
  saveWeddings();
  res.json(newWedding);
});
app.put("/api/weddings/:id", authenticateAdmin, (req, res) => {
  const idx = weddings.findIndex((w) => w.id === req.params.id);
  if (idx >= 0) {
    weddings[idx] = { ...weddings[idx], ...req.body };
    saveWeddings();
    res.json(weddings[idx]);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});
app.delete("/api/weddings/:id", authenticateAdmin, (req, res) => {
  weddings = weddings.filter((w) => w.id !== req.params.id);
  saveWeddings();
  res.json({ success: true });
});
app.get("/api/wedding-default", (req, res) => {
  if (weddings.length > 0) res.json(weddings[0]);
  else res.status(404).json({ error: "Not found" });
});
app.get("/api/wedding/:id", (req, res) => {
  const w = weddings.find((w2) => w2.id === req.params.id || w2.linkName === req.params.id);
  if (w) res.json(w);
  else res.status(404).json({ error: "Not found" });
});
app.post("/api/upload/:id", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo provided" });
    }
    const idParam = req.params.id || "demo";
    const w = weddings.find((w2) => w2.id === idParam || w2.linkName === idParam);
    const folderId = w ? w.id : idParam;
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: "Cloudinary is not configured on the server." });
    }
    const uploadResponse = await import_cloudinary.v2.uploader.upload(dataURI, {
      folder: `wedding_uploads/${folderId}`,
      resource_type: "auto"
    });
    res.json({ success: true, url: uploadResponse.secure_url, public_id: uploadResponse.public_id });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});
app.post("/api/download-zip/:id", authenticateAdmin, async (req, res) => {
  try {
    const { publicIds } = req.body;
    const idParam = req.params.id || "demo";
    const w = weddings.find((w2) => w2.id === idParam || w2.linkName === idParam);
    const folderId = w ? w.id : idParam;
    let zipUrl = "";
    if (publicIds && publicIds.length > 0) {
      zipUrl = import_cloudinary.v2.utils.download_zip_url({
        public_ids: publicIds,
        resource_type: "image"
      });
    } else {
      zipUrl = import_cloudinary.v2.utils.download_zip_url({
        prefixes: [`wedding_uploads/${folderId}/`],
        resource_type: "image"
      });
    }
    res.json({ url: zipUrl });
  } catch (error) {
    console.error("ZIP Generate Error:", error);
    res.status(500).json({ error: "Failed to generate ZIP url" });
  }
});
app.get("/api/photos/:id", authenticateAdmin, async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "Cloudinary API secret not configured." });
    }
    const idParam = req.params.id || "demo";
    const w = weddings.find((w2) => w2.id === idParam || w2.linkName === idParam);
    const folderId = w ? w.id : idParam;
    const result = await import_cloudinary.v2.api.resources({
      type: "upload",
      prefix: `wedding_uploads/${folderId}/`,
      max_results: 500,
      direction: "desc"
    });
    res.json({ photos: result.resources });
  } catch (error) {
    console.error("List Photos Error:", error);
    res.json({ photos: [] });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(import_express.default.static(import_path.default.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(process.cwd(), "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
