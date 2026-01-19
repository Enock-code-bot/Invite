require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static frontend files from root

// GET /api/invitation/:token - Fetch invitation details
app.get('/api/invitation/:token', (req, res) => {
    const token = req.params.token;
    db.get("SELECT * FROM invitations WHERE token = ?", [token], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Invitation not found" });
        }
        res.json(row);
    });
});

// POST /api/rsvp/accept - Handle Accept submission
app.post('/api/rsvp/accept', (req, res) => {
    const { invitation_id, name, email, attendees, notes } = req.body;

    if (!invitation_id || !name) {
        return res.status(400).json({ error: "Missing required fields (invitation_id, name)" });
    }

    const stmt = db.prepare(`INSERT INTO rsvp_responses (invitation_id, name, email, status, attendees, notes) VALUES (?, ?, ?, 'ACCEPTED', ?, ?)`);
    stmt.run(invitation_id, name, email || null, 1, notes || "", async function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }


        res.json({ message: "RSVP Accepted", id: this.lastID });
    });
    stmt.finalize();
});

// POST /api/rsvp/reject - Handle Reject submission
app.post('/api/rsvp/reject', (req, res) => {
    const { invitation_id, name, reason } = req.body;

    if (!invitation_id || !name) {
        return res.status(400).json({ error: "Missing required fields (invitation_id, name)" });
    }

    const stmt = db.prepare(`INSERT INTO rsvp_responses (invitation_id, name, status, reason) VALUES (?, ?, 'REJECTED', ?)`);
    stmt.run(invitation_id, name, reason || "", function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "RSVP Rejected", id: this.lastID });
    });
    stmt.finalize();
});

// GET /api/admin/responses - Fetch all responses
app.get('/api/admin/responses', (req, res) => {
    const query = `
        SELECT r.*, i.event_name 
        FROM rsvp_responses r 
        JOIN invitations i ON r.invitation_id = i.id 
        ORDER BY r.timestamp DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// DELETE /api/admin/responses/:id - Delete a response
app.delete('/api/admin/responses/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM rsvp_responses WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Response deleted", changes: this.changes });
    });
});

// GET /api/admin/export - Export responses to CSV
app.get('/api/admin/export', (req, res) => {
    const query = `
        SELECT r.name, r.email, r.status, r.attendees, r.notes, r.reason, r.timestamp, i.event_name 
        FROM rsvp_responses r 
        JOIN invitations i ON r.invitation_id = i.id 
        ORDER BY r.timestamp DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (rows.length === 0) {
            return res.status(404).send("No data to export");
        }

        const headers = ["Event", "Name", "Status", "Timestamp"];
        const csvRows = rows.map(row => [
            row.event_name,
            row.name,
            row.status,
            row.timestamp
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=rsvp_responses.csv');
        res.status(200).send(csvContent);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
