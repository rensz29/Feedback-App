# Zy WhatsApp Beta Test – Feedback Form

A small web app for the Zy beta test feedback form. Testers open one link on their phone, answer the 22 questions (in Tagalog, same as the form document), and tap **Ipadala ang feedback**. You see the results on a password-protected page and can download everything as a CSV for Excel or Google Sheets.

- Form: `http://<your-server>:6080/`
- Results: `http://<your-server>:6080/admin` (login from your `.env` file)
- CSV download: the button on the results page, or `http://<your-server>:6080/admin/export.csv`

## Launch with Docker

You need Docker with Docker Compose (Docker Desktop on Windows/Mac already has both).

```bash
# 1. Go into the folder
cd zy-feedback

# 2. Create your settings file and set a password for the results page
cp .env.example .env
#    then open .env and change ADMIN_PASSWORD

# 3. Build and start
docker compose up -d --build
```

Open http://localhost:6080 to see the form. Share `http://<server-ip-or-domain>:6080/` in the WhatsApp group.

### Everyday commands

| What | Command |
|---|---|
| See if it's running | `docker compose ps` |
| See the logs | `docker compose logs -f` |
| Stop it | `docker compose down` |
| Start it again | `docker compose up -d` |
| Apply changes after editing questions | `docker compose up -d --build` |

Responses are kept in the Docker volume `zy-feedback-data`, so they survive restarts and rebuilds. **`docker compose down -v` deletes the volume and all responses**, so download the CSV first if you ever need to run it.

### Back up the responses

Download the CSV from the results page, or copy the database file out of the container:

```bash
docker compose cp zy-feedback:/data/feedback.db ./feedback-backup.db
```

## Settings (`.env`)

| Setting | What it does | Default |
|---|---|---|
| `ADMIN_PASSWORD` | Password for the results page. Required. | – |
| `ADMIN_USER` | Username for the results page | `admin` |
| `HOST_PORT` | Port on your server | `6080` |
| `APP_TIMEZONE` | Time zone for times on the results page and CSV | `Asia/Manila` |

## Putting it on the internet

If testers will open the link outside the company network, put the app behind HTTPS so answers and your admin password aren't sent in plain text. The easiest routes:

- A reverse proxy you already have (Nginx, Caddy, Traefik) pointing to port 6080, or
- A hosting service that runs Docker containers (e.g. Render, Railway, Fly.io, a VPS). Mount a persistent disk at `/data` so responses aren't lost on redeploy.

## Changing the questions

All questions live in `shared/questions.js`. The form, the validation, the results page and the CSV columns are all built from that file, so edit it there and rebuild with `docker compose up -d --build`.

If you change questions after people have already answered, old responses keep their old answers; renamed options will show as separate rows in the results.

## What the form does

- Works on phones first: big tap targets, a progress bar at the top, and a count of how many required questions are left.
- Every question except 18–22 is required, checked both in the browser and on the server. If something is missing the tester sees which question and a short message in Tagalog.
- Question 11: "Wala akong naranasang problema" can't be picked together with a problem.
- Question 21 (name) rejects anything that looks like a phone number, as the form says.
- "Iba pa" on questions 2 and 11 shows an optional box to say what it is.
- No login for testers and no tracking. The only things stored are the answers and the time they were sent.
- Needs JavaScript in the browser, since the pages are built with React.

## Run without Docker (for testing)

You need Node.js 20.19 or newer.

```bash
npm install

# Development: reloads when you edit. Open http://localhost:5173
DATA_DIR=data ADMIN_PASSWORD=test npm run dev

# Or the production build. Open http://localhost:6080
npm run build
DATA_DIR=data ADMIN_PASSWORD=test npm start
```

## Files

```
zy-feedback/
├── client/              # React pages (built with Vite)
│   ├── index.html
│   ├── public/fonts/    # Barlow, OFL licence
│   └── src/             # form, thank-you and results pages, styles
├── server/
│   ├── index.js         # Express server: form endpoint, login, pages
│   ├── db.js            # SQLite storage
│   └── results.js       # results page data and CSV export
├── shared/
│   ├── questions.js     # all 22 questions – edit here
│   └── validation.js    # form rules, used by the browser and the server
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```
