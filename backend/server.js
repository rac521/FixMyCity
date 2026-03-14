const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'civicpulse_hackathon_super_secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- Database Setup ---
const dbSource = path.join(__dirname, 'fixmycity_v1.sqlite');
const db = new sqlite3.Database(dbSource, (err) => {
  if (err) {
    console.error("Database opening error: ", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    
    // Create tables
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'citizen',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Complaints Table
        db.run(`CREATE TABLE IF NOT EXISTS Complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            category TEXT NOT NULL,
            subcategory TEXT NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT,
            resolution_image_url TEXT,
            status TEXT DEFAULT 'Reported',
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(id)
        )`);

        // Departments Table
        db.run(`CREATE TABLE IF NOT EXISTS Departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )`);

        // Upvotes Table
        db.run(`CREATE TABLE IF NOT EXISTS Upvotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            complaint_id INTEGER,
            UNIQUE(user_id, complaint_id),
            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (complaint_id) REFERENCES Complaints(id)
        )`);

        // StatusUpdates Table
        db.run(`CREATE TABLE IF NOT EXISTS StatusUpdates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER,
            status TEXT NOT NULL,
            updated_by INTEGER,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (complaint_id) REFERENCES Complaints(id),
            FOREIGN KEY (updated_by) REFERENCES Users(id)
        )`);

        // Locations Table (normalized if needed, though lat/lng in complaints usually works for MVP)
        db.run(`CREATE TABLE IF NOT EXISTS Locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER,
            address TEXT,
            city TEXT,
            FOREIGN KEY (complaint_id) REFERENCES Complaints(id)
        )`);

        // Removed MVP auto-seed since we use seed.js with bcrypt hashes now
    });
  }
});

// ================= MIDDLEWARE =================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // For MVP transition, allow unauthenticated requests temporarily if missing token
    // (This ensures smooth front-end testing while we migrate the front-end)
    if (token == null) {
        req.user = { id: 1, role: 'citizen' }; // default fallback
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ================= API ROUTES =================

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", 
            [name, email, hashedPassword, role || 'citizen'], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User registered' });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM Users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: 'User not found' });
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
        
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
});

// GET /api/me (fetch current user from token)
app.get('/api/me', authenticateToken, (req, res) => {
    // If fake token logic fired
    if (req.user.role === 'fake') return res.json(null);
    res.json(req.user);
});

// POST /api/report - Create a new complaint
app.post('/api/report', authenticateToken, upload.single('image'), (req, res) => {
    const { category, subcategory, description, lat, lng } = req.body;
    const imageUrl = req.file ? '/uploads/' + req.file.filename : null;
    const userId = req.user.id;

    if (!category || !subcategory || !description || !lat || !lng) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare("INSERT INTO Complaints (user_id, category, subcategory, description, image_url, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run([userId, category, subcategory, description, imageUrl, lat, lng], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Complaint created successfully' });
    });
    stmt.finalize();
});

// GET /api/issues - Fetch all complaints with upvote counts
app.get('/api/issues', (req, res) => {
    const sql = `
        SELECT c.*, u.name as user_name,
        (SELECT COUNT(*) FROM Upvotes WHERE complaint_id = c.id) as upvote_count
        FROM Complaints c
        LEFT JOIN Users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET /api/issue/:id - Fetch single complaint
app.get('/api/issue/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT c.*, u.name as user_name,
        (SELECT COUNT(*) FROM Upvotes WHERE complaint_id = c.id) as upvote_count
        FROM Complaints c
        LEFT JOIN Users u ON c.user_id = u.id
        WHERE c.id = ?
    `;
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        
        // Also get status updates
        db.all("SELECT s.*, u.name as updater_name FROM StatusUpdates s LEFT JOIN Users u ON s.updated_by = u.id WHERE complaint_id = ? ORDER BY s.updated_at DESC", [id], (err, updates) => {
            res.json({ ...row, statusUpdates: updates || [] });
        });
    });
});

// POST /api/upvote - Upvote a complaint
app.post('/api/upvote', authenticateToken, (req, res) => {
    const { complaint_id } = req.body;
    const userId = req.user.id;
    
    db.run("INSERT INTO Upvotes (user_id, complaint_id) VALUES (?, ?)", [userId, complaint_id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                // Return success if already upvoted (idempotent)
                return res.json({ message: 'Already upvoted' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Upvoted successfully' });
    });
});

// PATCH /api/status - Update complaint status
app.patch('/api/status', authenticateToken, upload.single('resolution_image'), (req, res) => {
    const { complaint_id, status, notes } = req.body;
    const userId = req.user.id;
    
    // Only officers can update statuses
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
        const isFallback = req.user.id === 1; // if frontend lacking token, tolerate strictly for debugging MVP
        if (!isFallback) return res.status(403).json({ error: 'Unauthorized role' });
    }

    if (!complaint_id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.serialize(() => {
        let updateQuery = "UPDATE Complaints SET status = ?";
        let queryParams = [status];

        // Handle resolution image if provided
        if (req.file) {
            updateQuery += ", resolution_image_url = ?";
            queryParams.push('/uploads/' + req.file.filename);
        }

        updateQuery += " WHERE id = ?";
        queryParams.push(complaint_id);

        db.run(updateQuery, queryParams, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Complaint not found' });
            }

            db.run("INSERT INTO StatusUpdates (complaint_id, status, updated_by, notes) VALUES (?, ?, ?, ?)", 
                [complaint_id, status, userId, notes || `Status updated to ${status}`], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Status updated successfully' });
            });
        });
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
