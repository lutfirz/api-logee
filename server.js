// rincian pembayaran
// rute

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(express.json());
app.use(cors());

const supabaseUrl = 'https://jyeyttpoogzirkarinyu.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5ZXl0dHBvb2d6aXJrYXJpbnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3NTY2NDMsImV4cCI6MjA0MjMzMjY0M30.NER5Z0LDqPSHqGnyPB-7G8sXnx1gII5rPDuV2sH_NmE';
const supabase = createClient(supabaseUrl, supabaseKey);

mongoose
  .connect(
    'mongodb://lutfirazan:123@logee-shard-00-00.iowvi.mongodb.net:27017,logee-shard-00-01.iowvi.mongodb.net:27017,logee-shard-00-02.iowvi.mongodb.net:27017/?replicaSet=atlas-x7eqsc-shard-0&ssl=true&authSource=admin'
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Failed to connect to MongoDB', err));

const catalogSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  vehicleType: { type: String, required: true },
  isFrozen: { type: Boolean, required: true },
  weightCapacity: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
  isFragile: { type: Boolean, required: true },
  vendor: { type: String, required: true },
  rating: [Number],
  specs: [String],
  desc: { type: String, required: true },
  review: [String],
  driver: [String],
  price: { type: Number, required: true },
});

const Catalog = mongoose.model('Catalog', catalogSchema);

app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;

  try {
    // Read the file from the file system
    const filePath = path.join(__dirname, file.path);
    const fileBuffer = fs.readFileSync(filePath);

    // Upload the file to Supabase storage bucket
    const { data, error } = await supabase.storage
      .from('image') // Use the bucket you created
      .upload(`images/${file.filename}-${file.originalname}`, fileBuffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    // Clean up the local file after upload
    fs.unlinkSync(filePath);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get the public URL of the uploaded image
    const { publicURL } = supabase.storage
      .from('image')
      .getPublicUrl(`images/${file.filename}-${file.originalname}`);

    res.json({ message: 'File uploaded successfully', url: publicURL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/catalog', async (req, res) => {
  try {
    const catalogData = req.body;
    const newCatalog = new Catalog(catalogData);
    const savedCatalog = await newCatalog.save();
    res.json({
      message: 'Catalog added successfully',
      id: savedCatalog._id,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error adding catalog',
      error: err.message,
    });
  }
});

app.get('/catalogs', async (req, res) => {
  const catalogs = await Catalog.find(req.query);
  console.log(catalogs);
  res.json(catalogs);
});

app.get('/catalogs/:id', async (req, res) => {
  const _id = req.params.id;
  const catalog = await Catalog.findOne({ _id });
  if (!catalog) {
    return res.json('Catalog not found');
  }
  res.json(catalog);
});

app.listen(3000, () => {
  console.log('Server running on http://127.0.0.1:3000');
});
