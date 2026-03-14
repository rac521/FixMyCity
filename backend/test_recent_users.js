const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'fixmycity_v1.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err.message);

    db.all("SELECT * FROM Users ORDER BY id DESC LIMIT 10", [], (err, rows) => {
        if (err) return console.error(err.message);
        console.log("LAST 10 USERS:", rows);
    });
});
