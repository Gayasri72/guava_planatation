# 🌱 Guava Plantation Tracker — Client Handover Guide

A complete guide to using the app. Keep this document for reference.

---

## 1. What this app does

It helps you track guava fruit from the day you tie a colored bag on it, until the
day it is ready to harvest (about 90 days later), and reminds you automatically
when each batch is due. It also records your harvests and income.

**The core idea — color bags = batches**

Every week you tie colored plastic bags onto the new fruit clusters. All the fruit
you bag in one go gets the *same color* and becomes a **batch**. A batch has a
harvest date (bagged date + harvest days). The app tracks every batch and tells
you when its harvest day is near.

- A tree can have several colors at once (fruit bagged on different weeks).
- On the map, each tree shows the **color of its earliest (soonest-to-harvest) bag**.

---

## 2. Logging in

Open the app link in any phone or computer browser. There are two ways to sign in:

### A) Email & password (admin)
- **Email:** `admin@gmail.com`
- **Password:** `admin@123`

> Keep this password private. To change it, see **Section 7 → Reset the password**.

### B) Sign in with Google
Tap **Sign in with Google** and choose your account. Only Google accounts that have
been *approved* can enter (this is a security allowlist). If your Google account is
not approved you'll see "This Google account is not authorized." Ask the admin to
add your email (see **Section 7 → Allow more people to log in**).

---

## 3. Getting around (the menu)

**On a phone** there is a bar at the bottom of the screen:

| Button | What it shows |
|---|---|
| **Dashboard** | Summary: totals and batches harvesting soon |
| **Batches** | List of every color batch |
| **+ New Batch** | Create a new batch (bag fruit) |
| **Harvests** | Harvest + income records |
| **More** | Opens Trees (map), Notifications, Settings, Logout |

**On a computer** the same items appear in the left sidebar.

---

## 4. First-time setup (do this once)

When you first receive the app, the plantation is empty. Set it up in this order:

### Step 1 — Build your plantation map (add your trees)
1. Go to **More → Trees** (the Plantation Map).
2. In **"Add row"**, type a row letter (e.g. `A`) and how many trees are in that row
   (e.g. `10`), then tap **➕ Add row**.
3. This creates trees **A1, A2 … A10** shown as small squares in row A.
4. Repeat for every row (B, C, D …). Rows can be any length — 10, 12, 20, etc.

### Step 2 — Check your settings
1. Go to **More → Settings**.
2. Set **Default harvest days** (usually `90`).
3. Add the **Recipient emails** that should receive harvest alerts (you can add
   several — see Section 6).
4. Make sure the **email** channel is ticked.
5. Tap **Save settings**.

You're now ready to use it day to day.

---

## 5. Everyday scenarios (how to do each task)

### Scenario A — "I bagged new fruit today" (create a batch)
1. Tap **+ New Batch**.
2. Choose the **bag color** you used today (e.g. red).
3. Check the **Bagged date** (defaults to today).
4. Set **Harvest days** (defaults to 90 — change if you want).
5. Set **Default fruits/tree** (a starting number applied to each tree you tap).
6. In the tree list, **tap each tree** you bagged. For each selected tree you can
   type the exact **number of fruits** bagged on it.
   - Tip: use the **search box** to quickly find a tree code like `A5`.
7. The top shows a running total: how many trees and how many fruits.
8. Tap **Save Batch**. A green message confirms it was created.

The new batch now appears in **Batches**, and those trees turn that color on the map
(if it's their soonest bag).

### Scenario B — "Which trees harvest soonest?" (read the map)
1. Go to **More → Trees**.
2. Each tree square is **colored by its earliest bag**. The legend at the top shows
   what each color means.
3. A **white/empty square** = that tree has no active bag right now.
4. **Tap any tree** to see its code, its current bag color, and its expected harvest
   date with days remaining.

### Scenario C — "Harvest day changed for a batch" (adjust the date)
1. Go to **Batches** and tap the batch.
2. Change **Adjust harvest duration (days)** and tap **Save**.
3. The expected harvest date and all reminders update automatically.

### Scenario D — "It's harvest time" (log a harvest + income)
1. Go to **Batches** → open the batch → tap **🧺 Log Harvest**.
2. Fill in:
   - **Fruits picked** (defaults to the batch total)
   - **Weight (kg)**
   - **Quality** (A / B / C / Mixed)
   - **Price per kg** and **Buyer** (optional — for income tracking)
   - **Notes** (optional)
3. Tap **Save Harvest**. The app calculates the **revenue** (weight × price) and saves
   it under **Harvests**.

### Scenario E — "Add or remove a tree later"
- **Add one tree to a row:** open **Trees**, tap the dashed **+** at the end of that
  row. It adds the next number (e.g. A11).
- **Add many at once:** use the **Add row** box with the same row letter; it continues
  numbering from where the row left off.
- **Remove a tree:** tap the tree → tap **Remove** → tap **Confirm**. (Removing a tree
  does not affect harvest history already recorded.)

### Scenario F — "Check the dashboard"
**Dashboard** shows totals (trees, active batches, fruits) and the batches that are
harvesting soon, color-coded with days remaining. This is your morning overview.

---

## 6. Notifications — how reminders work

The app reminds you before each batch's harvest day so nothing is missed.

**When reminders fire:** by default **7 days, 3 days, and 1 day before** harvest, and
**on the harvest day** itself. You can change these "lead days" in **Settings**.

**How they're delivered:**
- **In-app** — shown on the **Notifications** page (the 🔔 bell).
- **Email** — sent to every address in **Settings → Recipient emails**.
- **SMS / WhatsApp** — optional, only if phone messaging is configured (see admin notes).

**Automatic daily check:** every morning (around **7:00 AM**) the app checks all
batches and sends any due reminders by itself. You don't have to do anything.

**Manual check:** on the **Notifications** page you can tap **Run check now** to check
immediately instead of waiting for the morning.

**Sending alerts to several people:** in **Settings → Recipient emails**, tap
**+ Add email** and enter each address. One reminder goes to all of them at once.
(Up to 4–5 is typical; more is fine.)

> Note: a reminder for a given batch and lead-day is sent only once (you won't get the
> same "3 days left" alert twice for the same batch).

---

## 7. Admin tasks (managing access & passwords)

### Allow more people to log in with Google
The list of approved Google accounts lives in a backend setting called
`ALLOWED_EMAILS`. To add people, edit it to a comma-separated list, e.g.:

```
ALLOWED_EMAILS=admin@gmail.com,owner@gmail.com,manager@gmail.com
```

- **Locally:** in `server/.env`, then restart the backend.
- **In production (Vercel):** Project → **Settings → Environment Variables** → update
  `ALLOWED_EMAILS` → redeploy.

This only affects **Google** sign-in. The `admin@gmail.com` email/password login
always works regardless.

### Reset the admin password
1. Edit `FARMER_PASSWORD` in `server/.env` to the new password.
2. Run: `npm run admin` (in the `server` folder).
3. The password is updated. (Update it on Vercel env vars too if you keep it there.)

### Recipient emails vs. login emails (don't mix these up)
| List | Where | Purpose |
|---|---|---|
| **Recipient emails** | In-app **Settings** | Who **receives** harvest alert emails |
| **`ALLOWED_EMAILS`** | Backend env var | Who can **log in** with Google |

They are independent. Someone can receive emails without logging in, and vice versa.

---

## 8. Maintenance & technical notes (for the developer/IT person)

### Email sending (Gmail)
Reminders are emailed through one Gmail "sender" account using these backend
environment variables (set locally in `server/.env` and in Vercel):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<sender gmail address>
SMTP_PASS=<16-char Gmail App Password>     # not the normal password
SMTP_FROM=Guava Tracker <sender gmail address>
```

The App Password is generated at https://myaccount.google.com/apppasswords (requires
2-Step Verification on the sender account). Recipients need nothing — they only receive.

### Useful commands (run inside the `server` folder)
| Command | What it does |
|---|---|
| `npm run dev` | Start the backend locally |
| `npm run admin` | Create / reset the admin login account in the database |
| `npm run seed` | Fill the database with sample trees + batches (demo only) |
| `npm run clean` | **Erase all plantation data** (trees, batches, harvests, notifications, settings) — keeps login accounts |

> ⚠ `npm run clean` is permanent. Use only for a fresh start.

### Deployment
Frontend and backend are deployed on **Vercel** as two projects. After changing code,
redeploy each. The daily 7 AM reminder runs as a Vercel Cron job. The database is
**MongoDB Atlas** (free tier) and is shared by local and production.

---

## 9. Troubleshooting

| Problem | Cause & fix |
|---|---|
| **Google sign-in: "Error 400: origin_mismatch"** | The site URL isn't registered. Google Cloud Console → Credentials → your OAuth client → **Authorized JavaScript origins** → add the exact site URL (e.g. `https://your-app.vercel.app`), save, wait 1–2 min. |
| **Google sign-in: "not authorized"** | The account isn't in `ALLOWED_EMAILS`. Add it (Section 7). |
| **No reminder emails arriving** | Check: email channel ticked in Settings; recipient emails entered; the Gmail `SMTP_*` variables are set; look in the **Spam** folder the first time. |
| **Button/feature missing after an update** | Redeploy the frontend on Vercel (the old version is cached until you redeploy). |
| **Forgot admin password** | Reset it with `npm run admin` after editing `FARMER_PASSWORD` (Section 7). |
| **A tree won't add (code already used)** | That code exists in another row/state. Use the next number or a different row letter. |

---

## 10. Quick cheat sheet

- **Bagged fruit today?** → **+ New Batch** → pick color → tap trees → enter fruit counts → Save.
- **What's ripe soon?** → **Dashboard** or the colored **Trees** map.
- **Harvested?** → **Batches** → open batch → **Log Harvest** → enter weight/price → Save.
- **Reminders?** → automatic each morning; add recipients in **Settings**.
- **Login:** `admin@gmail.com` / `admin@123`, or approved Google account.

---

*Guava Plantation Tracker — built for a single farm, optimized for mobile use.*
