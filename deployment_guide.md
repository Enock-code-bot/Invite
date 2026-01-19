# Deployment Guide

Your Elysium Privé RSVP system is ready for deployment. Below are the recommended paths to get this application online.

## 1. Local Network Sharing (Immediate)
Since it's running on your machine, you can use **ngrok** to create a temporary public URL for testing.
1. Download and install `ngrok`.
2. Run `ngrok http 3000` in your terminal.
3. Share the generated `https://...` link with your guests.

## 2. Professional Hosting (Recommended)
Because this application uses a SQLite database and Node.js, I recommend platforms that support persistent storage.

### Option A: Railway (Easiest)
1. Push your code to a GitHub repository.
2. Connect the repository to [Railway.app](https://railway.app/).
3. Railway will automatically detect the `package.json` and start the server.
4. **Important**: Add a "Volume" to your service to persist the `rsvp.db` file, or the data will be lost on每一次 restart.

### Option B: Render
1. Push your code to GitHub.
2. Create a "Web Service" on [Render](https://render.com/).
3. Add a "Disk" to persist the `rsvp.db` database.

## 3. Environment Variables
Make sure to set the following variables on your hosting platform's dashboard:
- `PORT`: (Set automatically by most hosts)
- `SMTP_HOST`: (Your production SMTP host)
- `SMTP_USER`: (Your email address)
- `SMTP_PASS`: (Your app password)
- `SMTP_PORT`: `465` or `587`
- `SMTP_SECURE`: `true` or `false`

## 4. Final Verification
Once deployed, verify that:
- [ ] Invitation links work (e.g., `https://your-app.com/index.html?t=ELYS-123-REFI`).
- [ ] RSVP data saves correctly.
- [ ] Ticket images download properly.
- [ ] Dashboard is accessible via your-app.com/dashboard.html.
