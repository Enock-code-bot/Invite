const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'rsvp.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Invitations table
    db.run(`CREATE TABLE IF NOT EXISTS invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE NOT NULL,
        event_name TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        event_location TEXT NOT NULL,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Guests / RSVP Responses table
    db.run(`CREATE TABLE IF NOT EXISTS rsvp_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invitation_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        status TEXT CHECK(status IN ('ACCEPTED', 'REJECTED')) NOT NULL,
        attendees INTEGER DEFAULT 0,
        notes TEXT,
        reason TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invitation_id) REFERENCES invitations(id)
    )`);

    // Insert a test invitation if none exists
    db.get("SELECT COUNT(*) as count FROM invitations", (err, row) => {
        if (row.count === 0) {
            const testToken = 'test-event-2026';
            db.run(`INSERT INTO invitations (token, event_name, event_date, event_time, event_location, message) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                [testToken, 'Elysium Privé', 'January 24, 2026', '19:00', 'Kinyinya Avenue',
                    'An evening of refined elegance and shared celebration.']);
            console.log(`Test invitation created with token: ${testToken}`);
        }
    });
});

module.exports = db;
