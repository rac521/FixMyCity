const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'fixmycity_v1.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err.message);

    db.all("SELECT * FROM Users", [], (err, rows) => {
        if (err) return console.error(err.message);
        console.log("TOTAL USERS:", rows.length);
        const testUser = rows.find(r => r.email === 'testsetup@demo.com');
        console.log("TEST USER:", testUser || "NOT FOUND");
        
        // Let's get the 5 most recently created users
        console.log("LAST 5 USERS:", rows.slice(-5));
    });
});
