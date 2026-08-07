import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
// Raised from the default 100kb — base64-encoded food photos are often
// several hundred KB to a few MB, so the default limit was rejecting
// submissions that included a photo (413 Payload Too Large).
app.use(express.json({ limit: '10mb' }));

// Database setup
const dbPath = path.join(__dirname, 'donations.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        name TEXT,
        phone TEXT
      )
    `, (usersErr) => {
      if (usersErr) {
        console.error('Error creating users table:', usersErr.message);
      } else {
        // Seed default NGO admin if not exists
        db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (!err && !row) {
            db.run(
              'INSERT INTO users (id, username, password, role, name, phone) VALUES (?, ?, ?, ?, ?, ?)',
              ['ngo_admin', 'admin', 'admin', 'ngo', 'NGO Central Admin', '+91 99999 99999']
            );
            console.log('Default NGO admin account seeded: admin / admin');
          }
        });
      }
    });

    // Create donations table
    db.run(`
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        donorId TEXT,
        donorName TEXT,
        phone TEXT,
        foodName TEXT,
        quantity TEXT,
        category TEXT,
        urgency TEXT,
        location TEXT,
        lat REAL,
        lng REAL,
        photo TEXT,
        notes TEXT,
        status TEXT,
        assignedVolunteerId TEXT,
        submittedAt TEXT
      )
    `, (createErr) => {
      if (createErr) {
        console.error('Error creating donations table:', createErr.message);
      } else {
        console.log('Database table initialized.');
        // Ensure new columns exist
        const columnsToCheck = [
          { name: 'lat', type: 'REAL' },
          { name: 'lng', type: 'REAL' },
          { name: 'photo', type: 'TEXT' },
          { name: 'donorId', type: 'TEXT' },
          { name: 'assignedVolunteerId', type: 'TEXT' }
        ];
        db.all('PRAGMA table_info(donations)', [], (pragmaErr, cols) => {
          if (pragmaErr) return;
          const existing = cols.map((c) => c.name);
          columnsToCheck.forEach(({ name, type }) => {
            if (!existing.includes(name)) {
              db.run(`ALTER TABLE donations ADD COLUMN ${name} ${type}`, (alterErr) => {
                if (alterErr) console.error(`Error adding column ${name}:`, alterErr.message);
                else console.log(`Added missing column: ${name}`);
              });
            }
          });
        });
      }
    });
  }
});

// API Routes

// POST register user
app.post('/api/auth/register', (req, res) => {
  const { username, password, role, name, phone } = req.body;
  if (!username || !password || !role || !name || !phone) {
    res.status(400).json({ error: 'Missing required registration fields' });
    return;
  }

  const id = 'usr_' + Date.now();
  db.run(
    'INSERT INTO users (id, username, password, role, name, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [id, username, password, role, name, phone],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: 'Username already exists' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      res.status(201).json({ id, username, role, name, phone });
    }
  );
});

// POST login user
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Missing username or password' });
    return;
  }

  db.get(
    'SELECT id, username, role, name, phone, password FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!user || user.password !== password) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }
      // Don't send password back
      const { password: _, ...userSafe } = user;
      res.json(userSafe);
    }
  );
});

// GET all volunteers (for NGO assignment)
app.get('/api/volunteers', (req, res) => {
  db.all(
    "SELECT id, name, phone, username FROM users WHERE role = 'volunteer'",
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// GET all users (donors and volunteers, for NGO view)
app.get('/api/users', (req, res) => {
  db.all(
    "SELECT id, name, phone, username, role FROM users WHERE role != 'ngo'",
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// GET all donations (joined with users)
app.get('/api/donations', (req, res) => {
  const query = `
    SELECT d.*, 
           u1.name as donorRealName, 
           u2.name as volunteerName, 
           u2.phone as volunteerPhone
    FROM donations d
    LEFT JOIN users u1 ON d.donorId = u1.id
    LEFT JOIN users u2 ON d.assignedVolunteerId = u2.id
    ORDER BY d.submittedAt DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST a new donation
app.post('/api/donations', (req, res) => {
  const {
    id, donorId, donorName, phone, foodName, quantity, category, urgency,
    location, lat, lng, photo, notes, status, assignedVolunteerId, submittedAt
  } = req.body;

  if (!id || !donorName || !foodName) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const query = `
    INSERT INTO donations (id, donorId, donorName, phone, foodName, quantity, category, urgency, location, lat, lng, photo, notes, status, assignedVolunteerId, submittedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      id, donorId ?? null, donorName, phone, foodName, quantity, category, urgency,
      location, lat ?? null, lng ?? null, photo ?? null, notes, status, assignedVolunteerId ?? null, submittedAt
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ 
        id, donorId, donorName, phone, foodName, quantity, category, urgency, 
        location, lat, lng, photo, notes, status, assignedVolunteerId, submittedAt 
      });
    }
  );
});

// PUT (update) an existing donation
app.put('/api/donations/:id', (req, res) => {
  const { id } = req.params;
  const {
    donorId, donorName, phone, foodName, quantity, category, urgency,
    location, lat, lng, photo, notes, status, assignedVolunteerId, submittedAt
  } = req.body;

  const query = `
    UPDATE donations
    SET donorId = COALESCE(?, donorId),
        donorName = COALESCE(?, donorName),
        phone = COALESCE(?, phone),
        foodName = COALESCE(?, foodName),
        quantity = COALESCE(?, quantity),
        category = COALESCE(?, category),
        urgency = COALESCE(?, urgency),
        location = COALESCE(?, location),
        lat = COALESCE(?, lat),
        lng = COALESCE(?, lng),
        photo = COALESCE(?, photo),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status),
        assignedVolunteerId = COALESCE(?, assignedVolunteerId),
        submittedAt = COALESCE(?, submittedAt)
    WHERE id = ?
  `;

  db.run(
    query,
    [
      donorId ?? null, donorName ?? null, phone ?? null, foodName ?? null, quantity ?? null, 
      category ?? null, urgency ?? null, location ?? null, lat ?? null, lng ?? null, 
      photo ?? null, notes ?? null, status ?? null, assignedVolunteerId ?? null, submittedAt ?? null, id
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Donation updated successfully', id });
    }
  );
});

// NGO endpoint to assign a volunteer to a donation
app.put('/api/donations/:id/assign', (req, res) => {
  const { id } = req.params;
  const { assignedVolunteerId } = req.body;

  db.run(
    'UPDATE donations SET assignedVolunteerId = ?, status = ? WHERE id = ?',
    [assignedVolunteerId, 'pending', id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Volunteer assigned successfully', id, assignedVolunteerId });
    }
  );
});

// DELETE a donation
app.delete('/api/donations/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM donations WHERE id = ?', id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Donation deleted successfully', id });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});