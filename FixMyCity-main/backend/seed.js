const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'fixmycity_v1.sqlite');

// Database must be initialized by server.js first
// so the tables actually exist when we seed data.

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
});

const dummyComplaints = [
    { category: 'Public Works', subcategory: 'Potholes', description: 'Large pothole on Main St causing damage to cars. Need immediate repair.', status: 'Reported', lat: 40.7128, lng: -74.0060, upvotes: 12 },
    { category: 'Electricity', subcategory: 'Broken Streetlight', description: 'Streetlight out near the park entrance, very dark at night and feels unsafe.', status: 'Assigned', lat: 40.7138, lng: -74.0160, upvotes: 5 },
    { category: 'Sanitation', subcategory: 'Garbage Accumulation', description: 'Garbage overflowing from public bins on 5th Ave. Has not been collected in days.', status: 'In Progress', lat: 40.7228, lng: -73.9960, upvotes: 8 },
    { category: 'Water Supply', subcategory: 'Leaking Fire Hydrant', description: 'Water leaking continuously from a fire hydrant.', status: 'Resolved', lat: 40.7028, lng: -74.0160, upvotes: 2 },
    { category: 'Sanitation', subcategory: 'Clogged Drains', description: 'Blocked drain causing flooding after heavy rain near the intersection.', status: 'Reported', lat: 40.7328, lng: -73.9860, upvotes: 15 },
    { category: 'Public Infrastructure', subcategory: 'Damaged Park Bench', description: 'Park bench broken and unsafe to sit on.', status: 'Assigned', lat: 40.7158, lng: -74.0080, upvotes: 3 },
    { category: 'Public Works', subcategory: 'Damaged Roads', description: 'Multiple deep potholes along the highway ramp. Very dangerous at high speeds.', status: 'Resolved', lat: 40.7288, lng: -74.0100, upvotes: 22 },
];

db.serialize(() => {
    console.log("Cleaning existing data to re-seed...");
    db.run("DELETE FROM Upvotes");
    db.run("DELETE FROM StatusUpdates");
    db.run("DELETE FROM Complaints");
    
    console.log("Seeding new data...");
    
    // Default password 'password123'
    const defaultHash = '$2b$10$LUES3VejNDfMwMMMWgVV7OTLcjOjQ6waQxYSi9jkrmLVDxqReG1Km';

    // Ensure demo users exist
    db.run(`INSERT OR IGNORE INTO Users (id, name, email, password_hash, role) VALUES (1, 'Demo Citizen', 'citizen@demo.com', '${defaultHash}', 'citizen')`);
    db.run(`INSERT OR IGNORE INTO Users (id, name, email, password_hash, role) VALUES (2, 'Demo Officer', 'officer@demo.com', '${defaultHash}', 'officer')`);

    // Create shadow users
    for (let i = 100; i < 150; i++) {
        db.run(`INSERT OR IGNORE INTO Users (id, name, email, password_hash, role) VALUES (${i}, 'Citizen ${i}', 'user${i}@demo.com', '${defaultHash}', 'citizen')`);
    }

    const stmt = db.prepare("INSERT INTO Complaints (id, user_id, category, subcategory, description, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const upvoteStmt = db.prepare("INSERT INTO Upvotes (user_id, complaint_id) VALUES (?, ?)");
    const statusStmt = db.prepare("INSERT INTO StatusUpdates (complaint_id, status, updated_by, notes) VALUES (?, ?, ?, ?)");
    
    dummyComplaints.forEach((c, index) => {
        const complaint_id = index + 1;
        stmt.run([complaint_id, 1, c.category, c.subcategory, c.description, c.status, c.lat, c.lng], function(err) {
            if (err) {
                console.error('Error inserting complaint:', err.message);
            } else {
                for (let i = 0; i < c.upvotes; i++) {
                    const voterId = 100 + i; 
                    upvoteStmt.run([voterId, complaint_id]);
                }

                if (c.status !== 'Reported') {
                    statusStmt.run([complaint_id, c.status, 2, 'Status updated by demo officer']);
                }
            }
        });
    });
    
    // Let the statements run and rely on the process exit for cleanup
    
    setTimeout(() => {
        console.log("Seeding complete. You can now refresh the application pages!");
        db.close();
        process.exit(0);
    }, 1500);
});
