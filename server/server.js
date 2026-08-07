import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
// Raised from the default 100kb — base64-encoded food photos are often
// several hundred KB to a few MB, so the default limit was rejecting
// submissions that included a photo (413 Payload Too Large).
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedtheneed';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB at:', MONGODB_URI);
    seedDefaultAdmin();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// Schemas & Models
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

const donationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  donorId: { type: String },
  donorName: { type: String, required: true },
  phone: { type: String },
  foodName: { type: String, required: true },
  quantity: { type: String },
  category: { type: String },
  urgency: { type: String },
  location: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  photo: { type: String },
  notes: { type: String },
  status: { type: String },
  assignedVolunteerId: { type: String },
  submittedAt: { type: String }
});

const Donation = mongoose.model('Donation', donationSchema);

// Seed default NGO admin if not exists
async function seedDefaultAdmin() {
  try {
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      await User.create({
        id: 'ngo_admin',
        username: 'admin',
        password: 'admin',
        role: 'ngo',
        name: 'NGO Central Admin',
        phone: '+91 99999 99999'
      });
      console.log('Default NGO admin account seeded: admin / admin');
    }
  } catch (err) {
    console.error('Error seeding default admin:', err.message);
  }
}

// API Routes

// POST register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role, name, phone } = req.body;
    if (!username || !password || !role || !name || !phone) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const id = 'usr_' + Date.now();
    const newUser = await User.create({ id, username, password, role, name, phone });
    res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role, name: newUser.name, phone: newUser.phone });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// POST login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const userSafe = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      phone: user.phone
    };
    res.json(userSafe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all volunteers (for NGO assignment)
app.get('/api/volunteers', async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }, 'id name phone username');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users (donors and volunteers, for NGO view)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'ngo' } }, 'id name phone username role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all donations with query filtering
app.get('/api/donations', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.urgency) filter.urgency = req.query.urgency;
    if (req.query.donorId) filter.donorId = req.query.donorId;
    if (req.query.assignedVolunteerId) filter.assignedVolunteerId = req.query.assignedVolunteerId;

    const donations = await Donation.find(filter).sort({ submittedAt: -1 }).lean();

    const userIds = new Set();
    donations.forEach(d => {
      if (d.donorId) userIds.add(d.donorId);
      if (d.assignedVolunteerId) userIds.add(d.assignedVolunteerId);
    });

    const users = await User.find({ id: { $in: Array.from(userIds) } }).lean();
    const userMap = new Map(users.map(u => [u.id, u]));

    const result = donations.map(d => ({
      ...d,
      donorRealName: userMap.get(d.donorId)?.name || d.donorName,
      volunteerName: userMap.get(d.assignedVolunteerId)?.name || null,
      volunteerPhone: userMap.get(d.assignedVolunteerId)?.phone || null
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single donation by ID (path parameter endpoint)
app.get('/api/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findOne({ id }).lean();
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const donor = donation.donorId ? await User.findOne({ id: donation.donorId }).lean() : null;
    const volunteer = donation.assignedVolunteerId ? await User.findOne({ id: donation.assignedVolunteerId }).lean() : null;

    res.json({
      ...donation,
      donorRealName: donor?.name || donation.donorName,
      volunteerName: volunteer?.name || null,
      volunteerPhone: volunteer?.phone || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new donation
app.post('/api/donations', async (req, res) => {
  try {
    const {
      id, donorId, donorName, phone, foodName, quantity, category, urgency,
      location, lat, lng, photo, notes, status, assignedVolunteerId, submittedAt
    } = req.body;

    if (!id || !donorName || !foodName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newDonation = await Donation.create({
      id, donorId, donorName, phone, foodName, quantity, category, urgency,
      location, lat, lng, photo, notes, status, assignedVolunteerId, submittedAt
    });

    res.status(201).json(newDonation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (update) an existing donation
app.put('/api/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    const fields = [
      'donorId', 'donorName', 'phone', 'foodName', 'quantity', 'category', 'urgency',
      'location', 'lat', 'lng', 'photo', 'notes', 'status', 'assignedVolunteerId', 'submittedAt'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const donation = await Donation.findOneAndUpdate({ id }, { $set: updateData }, { new: true });
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ message: 'Donation updated successfully', id, donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NGO endpoint to assign a volunteer to a donation
app.put('/api/donations/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedVolunteerId } = req.body;

    const donation = await Donation.findOneAndUpdate(
      { id },
      { $set: { assignedVolunteerId, status: 'pending' } },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ message: 'Volunteer assigned successfully', id, assignedVolunteerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a donation
app.delete('/api/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Donation.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    res.json({ message: 'Donation deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});