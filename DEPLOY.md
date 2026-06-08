# Deploying to Vercel

You'll create **two separate Vercel projects** from this one repo:

| Project | Root directory | What it serves |
|---|---|---|
| `guava-api` | `server/` | Express backend (serverless) + daily cron |
| `guava-web` | `client/` | React frontend (static) |

Install the CLI once: `npm i -g vercel` and run `vercel login`.

---

## Step 1 — Deploy the backend

```bash
cd server
vercel            # first run: link/create project "guava-api"
```

When prompted for settings, accept defaults (no build command needed — the
`api/` folder is auto-detected as a serverless function).

### Set backend environment variables

In the Vercel dashboard → **guava-api → Settings → Environment Variables**, add
everything from `server/.env` **except** `PORT` and `NODE_ENV`:

| Key | Value |
|---|---|
| `MONGODB_URI` | your Atlas connection string (with `/plantation`) |
| `JWT_SECRET` | a long random string |
| `JWT_EXPIRES_IN` | `30d` |
| `GOOGLE_CLIENT_ID` | `1054...na.apps.googleusercontent.com` |
| `ALLOWED_EMAILS` | `pethumkumarana3@gmail.com` |
| `CRON_SECRET` | a long random string (protects the cron endpoint) |
| `SMTP_*`, `TWILIO_*` | your email/SMS creds (optional) |
| `CLIENT_URL` | *(fill in after Step 2)* |

Then redeploy: `vercel --prod`. Note the production URL, e.g.
`https://guava-api.vercel.app`.

**Verify:** open `https://guava-api.vercel.app/health` → should return `{"ok":true}`.

---

## Step 2 — Deploy the frontend

```bash
cd ../client
vercel            # create project "guava-web"
```

### Set frontend environment variables

In **guava-web → Settings → Environment Variables**:

| Key | Value |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | same Google client ID as the backend |
| `VITE_API_URL` | `https://guava-api.vercel.app/api` *(note the `/api`)* |

Vercel auto-detects Vite (build `npm run build`, output `dist`). Deploy:

```bash
vercel --prod
```

Note the URL, e.g. `https://guava-web.vercel.app`.

---

## Step 3 — Wire the two together

1. **Backend CORS** — set `CLIENT_URL=https://guava-web.vercel.app` in the
   guava-api env vars, then `vercel --prod` again from `server/`.

2. **Google OAuth origins** — in
   [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials),
   open your OAuth client and add to **Authorized JavaScript origins**:
   - `https://guava-web.vercel.app`

---

## Step 4 — Seed the production database (once)

Your Atlas DB needs the 1000 trees + farmer account. Run the seed locally
against the production DB (your local `.env` already points at Atlas):

```bash
cd server
npm run seed
```

---

## Notes & gotchas

- **Cron on the free Hobby plan runs once per day** — perfect for the 7 AM
  harvest check (`0 7 * * *`). Confirm it under **guava-api → Settings → Cron Jobs**.
- **Notification contact** — the serverless app doesn't run the local bootstrap,
  so after first deploy open the app → **Settings** and confirm the email/phone
  and channels are set (or the `npm run seed` above will have set them).
- **Cold starts** — the first request after idle takes ~1–2s while the function
  spins up and connects to Mongo. Subsequent requests are fast (connection cached).
- **Atlas Network Access** — make sure `0.0.0.0/0` is allowed, since Vercel
  function IPs are dynamic.
- **Secrets** — `JWT_SECRET`, `CRON_SECRET`, and your Mongo password should be
  real random values in production, not the dev placeholders.
