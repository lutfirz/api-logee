// rincian pembayaran
// rute

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

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
  const catalogs = await Catalog.find();
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
