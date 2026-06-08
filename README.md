# 🌱 Guava Plantation Tracker

A web app to track guava fruit batches (the colored-bag system) and harvest-day notifications for a single-farmer plantation of up to ~1000 trees.

## Why this app

Farmer ties colored bags on fruit clusters each week (🔴 red, 🟡 yellow, 🔵 blue …). Each color is a **batch** — a time cohort that ripens together. After 90 days (configurable per batch), that color is ready to harvest. The app:

- Tracks every batch (color + bagged date + trees + fruit count)
- Calculates the expected harvest date
- Notifies the farmer (in-app, email, SMS / WhatsApp) at 7 / 3 / 1 days before harvest
- Logs actual yields (kg, fruits, quality, price, buyer) — ready for income analytics

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (free M0 tier) via Mongoose |
| Auth | JWT |
| Notifications | node-cron + Nodemailer (Gmail SMTP) + Twilio (SMS / WhatsApp) |

## Project layout

```
plantation/
├── server/                # Express API
│   └── src/
│       ├── models/        # Tree, Batch, HarvestRecord, Notification, Settings, User
│       ├── controllers/
│       ├── routes/
│       ├── services/      # email, sms, notification dispatcher
│       ├── scheduler/     # cron harvest checker
│       ├── scripts/       # bootstrap + seed
│       └── index.js
└── client/                # React app
    └── src/
        ├── pages/         # Dashboard, Trees, NewBatch, Batches, BatchDetail, Harvests, Notifications, Settings, Login
        ├── components/    # Layout, ColorBadge
        └── api/client.js
```

## Setup

### 1. MongoDB Atlas (free tier)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create an M0 (free) cluster
3. **Database Access** → create a user (note username + password)
4. **Network Access** → allow `0.0.0.0/0` (or your IP)
5. Copy the connection string — looks like `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, FARMER_EMAIL/PASSWORD, SMTP_*, TWILIO_*
npm install
npm run seed       # creates farmer account + 1000 trees + 4 sample batches
npm run dev        # starts API on :4000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev        # starts UI on :5173
```

Open http://localhost:5173 and log in with the credentials from `.env`.

### 4. Email (Gmail App Password)

- Enable 2-step verification on your Gmail account
- Generate an App Password: https://myaccount.google.com/apppasswords
- Put it in `SMTP_PASS`

### 5. SMS / WhatsApp (Twilio)

- Sign up at https://www.twilio.com (free trial credit)
- Get your Account SID, Auth Token, and a Twilio phone number
- For WhatsApp, use the Twilio Sandbox: https://www.twilio.com/console/sms/whatsapp/sandbox

## How a farmer uses it

1. **Day 1** — 120 trees have new fruits. Farmer ties 🔴 red bags. In app: **New Batch → red → enter trees + fruit counts → Save**.
2. **Day 8** — Another wave. 🟡 yellow bags. Some trees from the red batch also get yellow bags (multiple cohorts per tree are fine).
3. **Days 80–90** — On the 7th day before harvest, the cron job (runs daily at 7 AM) fires the first notification (in-app + email + SMS). Same again at 3 days, 1 day, and on harvest day.
4. **Harvest day** — Pick only red-bag fruits. Open the batch → **Log Harvest** → enter kg, price, buyer.
5. **Dashboard** — Always shows active batches with days-until-harvest.

## Deployment (free tier)

| Component | Service | Notes |
|---|---|---|
| Frontend | Vercel | `vercel --prod` from `client/` |
| Backend | Render / Railway / Fly.io | Set env vars; `npm start` |
| Database | MongoDB Atlas | Already free |

For Render: set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (the Vercel URL), Gmail and Twilio creds.

For Vercel: set `VITE_API_URL` if pointing to a separate API host (the proxy in `vite.config.js` is dev-only).

## Testing notifications without waiting

The app exposes a dev endpoint to run the harvest check on demand:

```bash
# From the Notifications page → "Run harvest check now"
# Or:
curl -X POST http://localhost:4000/api/dev/run-check -H "Authorization: Bearer <token>"
```

## Roadmap / scalability

The schema is built for growth — no migration needed for these:

- **Income & expense tracking** — `HarvestRecord` already stores `pricePerKg`, `revenue`, `buyer`
- **Per-tree yield analytics** — aggregate `batches.trees[]` joined with `harvestRecords`
- **Photos per batch** — add an `images: [String]` field, upload to Cloudflare R2
- **Multi-user (workers)** — `User` collection + `role` enum already there
- **Weather correlation** — daily OpenWeather snapshot + join by `baggedDate`
- **CSV import for 1000-tree bootstrap** — `POST /api/trees/bulk` is ready

## License

MIT
