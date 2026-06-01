import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Wedding Data Management
const dataFile = path.join(process.cwd(), 'weddings.json');
let weddings: any[] = [];
const loadWeddings = () => {
  if (fs.existsSync(dataFile)) {
    try {
      weddings = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch(e) {
      console.error("Error reading weddings.json", e);
    }
  }
  if (weddings.length === 0) {
    weddings = [{
      id: "demo",
      linkName: "demo",
      brideName: "Elif",
      groomName: "Can",
      text1: "Hikayemiz Başlıyor...",
      text2: "Masalsı anılarımıza ve en mutlu günümüze ortak olduğunuz için sonsuz teşekkürler."
    }];
  }
};
const saveWeddings = () => {
  fs.writeFileSync(dataFile, JSON.stringify(weddings, null, 2));
};
loadWeddings();

// Ensure PIN authentication
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const pin = req.headers['x-admin-pin'];
  const correctPin = '356807';
  if (pin !== correctPin) {
    return res.status(401).json({ error: 'Unauthorized. Invalid PIN.' });
  }
  next();
};

// API Route: Verify PIN
app.post('/api/auth', (req, res) => {
  const { pin } = req.body;
  const correctPin = '356807';
  if (pin === correctPin) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid PIN' });
  }
});

// --- Wedding Management Endpoints ---
app.get('/api/weddings', authenticateAdmin, (req, res) => {
  res.json(weddings);
});

app.post('/api/weddings', authenticateAdmin, (req, res) => {
  const newWedding = { 
    id: Date.now().toString(), 
    linkName: req.body.linkName || `dugun-${Date.now()}`,
    brideName: req.body.brideName || 'Gelin',
    groomName: req.body.groomName || 'Damat',
    text1: req.body.text1 || 'Hikayemiz Başlıyor...',
    text2: req.body.text2 || 'Mutlu günümüze ortak olduğunuz için teşekkürler.'
  };
  weddings.push(newWedding);
  saveWeddings();
  res.json(newWedding);
});

app.put('/api/weddings/:id', authenticateAdmin, (req, res) => {
  const idx = weddings.findIndex(w => w.id === req.params.id);
  if (idx >= 0) {
    weddings[idx] = { ...weddings[idx], ...req.body };
    saveWeddings();
    res.json(weddings[idx]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/weddings/:id', authenticateAdmin, (req, res) => {
  weddings = weddings.filter(w => w.id !== req.params.id);
  saveWeddings();
  res.json({ success: true });
});

app.get('/api/wedding-default', (req, res) => {
  if (weddings.length > 0) res.json(weddings[0]);
  else res.status(404).json({ error: 'Not found' });
});

app.get('/api/wedding/:id', (req, res) => {
  const w = weddings.find(w => w.id === req.params.id || w.linkName === req.params.id);
  if (w) res.json(w);
  else res.status(404).json({ error: 'Not found' });
});

// API Route: Upload Image to Cloudinary folder (by wedding id)
app.post('/api/upload/:id', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo provided' });
    }
    const idParam = req.params.id || 'demo';
    const w = weddings.find(w => w.id === idParam || w.linkName === idParam);
    const folderId = w ? w.id : idParam;

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: 'Cloudinary is not configured on the server.' });
    }

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: `wedding_uploads/${folderId}`,
      resource_type: "auto"
    });

    res.json({ success: true, url: uploadResponse.secure_url, public_id: uploadResponse.public_id });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// API Route: Build Cloudinary ZIP download
app.post('/api/download-zip/:id', authenticateAdmin, async (req, res) => {
  try {
    const { publicIds } = req.body;
    const idParam = req.params.id || 'demo';
    const w = weddings.find(w => w.id === idParam || w.linkName === idParam);
    const folderId = w ? w.id : idParam;
    let zipUrl = '';

    if (publicIds && publicIds.length > 0) {
      zipUrl = cloudinary.utils.download_zip_url({
        public_ids: publicIds,
        resource_type: 'image'
      });
    } else {
      zipUrl = cloudinary.utils.download_zip_url({
        prefixes: [`wedding_uploads/${folderId}/`],
        resource_type: 'image'
      });
    }

    res.json({ url: zipUrl });
  } catch (error) {
    console.error('ZIP Generate Error:', error);
    res.status(500).json({ error: 'Failed to generate ZIP url' });
  }
});

// API Route: List 
app.get('/api/photos/:id', authenticateAdmin, async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary API secret not configured.' });
    }
    const idParam = req.params.id || 'demo';
    const w = weddings.find(w => w.id === idParam || w.linkName === idParam);
    const folderId = w ? w.id : idParam;

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `wedding_uploads/${folderId}/`,
      max_results: 500,
      direction: 'desc'
    });

    res.json({ photos: result.resources });
  } catch (error) {
    console.error('List Photos Error:', error);
    res.json({ photos: [] }); // Or send error
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
}

startServer();
