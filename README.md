<div align="center">

# 🎯 TrackIt

### Your Opportunities. Tracked. Delivered. Never Missed.

**TrackIt** is a full-stack opportunity management platform built for students, teachers, and institutions. It aggregates scholarships, internships, competitions, fellowships, grants, and more — all in one place — and actively reminds students before deadlines pass.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://www.mongodb.com/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [User Roles](#-user-roles)
- [Event Lifecycle](#-event-lifecycle)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Reminder System](#-reminder-system)
- [Scam Detection Engine](#-scam-detection-engine)
- [Notification Channels](#-notification-channels)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

TrackIt solves a painful problem students face every day: **great opportunities get missed because no one told them about it in time.**

Teachers, admins, and institutions post opportunities (scholarships, hackathons, internships, grants). Students discover, save, and apply. TrackIt's reminder engine ensures no deadline silently passes — students receive timely alerts via Slack, email, and in-app notifications. After an event closes, students can rate it for quality, accuracy, and legitimacy, building a trusted, community-verified opportunity feed.

---

## ✨ Features

### For Students
- 🔍 Discover curated, admin-approved opportunities
- 🔖 Save / bookmark events of interest
- 📅 Track application status in a personal dashboard
- 🔔 Receive deadline reminders (7 days → 3 days → 1 day → 1 hour)
- ⭐ Rate opportunities after the deadline for accuracy & legitimacy
- 📤 Share opportunities with peers

### For Teachers / Opportunity Posters
- 📝 Post opportunities with title, description, deadline, eligibility criteria, and application link
- 📊 View engagement stats on posted events

### For Admins
- 🛡️ Review pending events in a moderation dashboard
- ✅ Approve or reject submissions
- 🚨 View scam-flagged events for manual inspection
- 📈 Access platform analytics and event archive

### Platform-Wide
- 🤖 Automated scam detection on event submissions
- 🗂️ Calendar and listing views for all published events
- 🗄️ Event archiving for reference and analytics
- 🔄 Real-time notifications

---

## 🏗️ System Architecture

```
[Teacher / Student / Admin Posts Event]
              │
              ▼
    [Scam Detection Engine]
    ─ Suspicious keyword scan
    ─ Short description flag
    ─ Suspicious link check
              │
       ┌──────┴──────┐
  Flagged?         Clean
       │               │
  isScam=true    status="pending"
       │               │
       └──────┬─────────┘
              ▼
     [Admin Moderation Dashboard]
     ─ View pending events
     ─ Approve OR Reject
              │
       ┌──────┴──────┐
   Rejected        Approved
    (notified)          │
                        ▼
              [Event Published Publicly]
              ─ Public listing page
              ─ Student dashboard
              ─ Calendar view
                        │
                        ▼
           [Student Interaction Layer]
           ├── Save (bookmark)
           ├── Apply (external link)
           └── Share
                        │
                        ▼
            [Reminder Engine — Cron Job]
            ─ 7 days before deadline
            ─ 3 days before deadline
            ─ 1 day before deadline
            ─ 1 hour before deadline
                        │
                        ▼
     [Notifications Sent]
     ├── Slack message
     ├── Email
     └── In-app alert
                        │
                        ▼
              [Deadline Reached]
              status = "closed"
                        │
                        ▼
        [Student Ratings & Feedback]
        ─ Usefulness (1–5)
        ─ Accuracy (1–5)
        ─ Legitimacy (1–5)
        ─ Written feedback
                        │
                        ▼
              [Event Archived]
              ─ Visible for reference
              ─ Available in analytics
```

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse events, save, apply, track applications, receive reminders, rate events |
| **Teacher** | Post opportunities, view their own event stats |
| **Admin** | Post opportunities, moderate all pending events, view platform analytics, access archive |
| **System** | Automated scam detection, cron-based reminders, notification dispatch, event archiving |

---

## 🔄 Event Lifecycle

```
draft → pending → (approved | rejected)
                       │
                   published
                       │
                    closed
                       │
                   archived
```

| Status | Description |
|--------|-------------|
| `pending` | Submitted, awaiting admin approval |
| `flagged` | Scam detection raised a concern, awaiting manual review |
| `published` | Approved and visible to all students |
| `closed` | Deadline has passed, no new applications |
| `archived` | Moved to archive for reference and analytics |
| `rejected` | Declined by admin |

---

## 🛠️ Tech Stack

### Frontend (`client/trackit`)
| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | Core React framework, SSR/SSG |
| **JavaScript (ES Modules)** | Primary language (`jsconfig.json`, `.mjs` configs) |
| **Tailwind CSS** | Utility-first styling (`postcss.config.mjs`) |
| **ESLint** | Code linting (`eslint.config.mjs`) |
| **Next.js Config** | Custom routing, image domains (`next.config.mjs`) |

### Backend (`server`)
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | REST API layer (`app.js`) |
| **JavaScript** | Primary language throughout |
| **Mongoose** | MongoDB ODM — models defined in `models/` |
| **node-cron** | Scheduled jobs for the reminder engine |
| **JWT + bcrypt** | Authentication (`auth.middleware.js`) and password hashing |
| **Nodemailer** | Email delivery (`email.controller.js`) |
| **Custom error handler** | Centralised error responses (`error.middleware.js`) |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB** | Primary NoSQL database (Mongoose models) |
| **Mongoose** | Schema definition, validation, query building |
| **`seed.js`** | Database seeder for local development |

### Notifications & Integrations
| Technology | Purpose |
|------------|---------|
| **Nodemailer + SMTP** | Transactional email delivery (`email.controller.js`) |
| **Slack Web API** | Slack channel / DM notifications |
| **In-app alerts** | Notification records stored in DB |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Vercel** *(frontend)* | CI/CD and edge hosting for Next.js |
| **Railway / Render** *(backend)* | Node.js + MongoDB hosting |
| **GitHub Actions** | Automated testing and deployment pipelines |

---

## 📂 Project Structure

```
TrackIt/                              # Root
├── .gitignore
├── README.md
│
├── client/                           # Frontend — Next.js 14
│   └── trackit/
│       ├── app/                      # Next.js App Router (pages & layouts)
│       ├── public/                   # Static assets
│       │   ├── file.svg
│       │   ├── globe.svg
│       │   ├── next.svg
│       │   ├── vercel.svg
│       │   └── window.svg
│       ├── .gitignore
│       ├── README.md
│       ├── eslint.config.mjs         # ESLint configuration
│       ├── jsconfig.json             # JS path aliases & compiler options
│       ├── next.config.mjs           # Next.js configuration
│       ├── package-lock.json
│       ├── package.json
│       └── postcss.config.mjs        # PostCSS / Tailwind CSS setup
│
└── server/                           # Backend — Node.js + Express
    ├── config/
    │   ├── database.js               # MongoDB connection setup
    │   └── env.js                    # Environment variable loader
    ├── controller/
    │   ├── application.controller.js # Application save/apply/track logic
    │   ├── auth.controller.js        # Register, login, JWT issuance
    │   ├── email.controller.js       # Nodemailer email dispatch
    │   ├── event.cleanup.js          # Deadline closing & archiving logic
    │   ├── event.controller.js       # CRUD for events, scam check trigger
    │   └── user.controller.js        # User profile management
    ├── middleware/
    │   ├── auth.middleware.js        # JWT verification & role extraction
    │   └── error.middleware.js       # Global error handler
    ├── models/
    │   ├── application.model.js      # Application schema (userId, eventId, status)
    │   ├── event.model.js            # Event schema (title, deadline, status, isScam…)
    │   └── user.model.js             # User schema (name, email, password, role)
    ├── routes/
    │   ├── application.route.js      # /api/applications
    │   ├── auth.route.js             # /api/auth
    │   ├── event.route.js            # /api/events
    │   └── user.routes.js            # /api/users
    ├── .gitignore
    ├── app.js                        # Express app entry point
    ├── package-lock.json
    ├── package.json
    └── seed.js                       # Database seeder script
```

---

## 🗄️ Database Schema

The backend uses **MongoDB** with **Mongoose** for schema definition. The three core models map directly to the files in `server/models/`.

### User (`user.model.js`)

```js
{
  name:      String,   // required
  email:     String,   // required, unique
  password:  String,   // hashed with bcrypt
  role:      String,   // enum: ["student", "teacher", "admin"], default: "student"
  createdAt: Date      // default: Date.now
}
```

### Event (`event.model.js`)

```js
{
  title:       String,   // required
  description: String,   // required
  deadline:    Date,     // required
  eligibility: String,
  link:        String,   // required — external application URL
  status:      String,   // enum: ["pending","flagged","published","closed","archived","rejected"]
                         // default: "pending"
  isScam:      Boolean,  // default: false — set by scam detection engine
  postedBy:    ObjectId, // ref: "User"
  createdAt:   Date      // default: Date.now
}
```

### Application (`application.model.js`)

```js
{
  userId:    ObjectId,  // ref: "User", required
  eventId:   ObjectId,  // ref: "Event", required
  status:    String,    // enum: ["saved", "applied", "withdrawn"], default: "saved"
  createdAt: Date       // default: Date.now
}
// Compound unique index on [userId, eventId]
```

### Rating (planned)

```js
{
  userId:     ObjectId,  // ref: "User"
  eventId:    ObjectId,  // ref: "Event"
  usefulness: Number,    // 1–5
  accuracy:   Number,    // 1–5
  legitimacy: Number,    // 1–5
  feedback:   String,
  createdAt:  Date
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v15 or higher (or Docker)
- **npm** or **yarn**
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Bolice1/TrackIt.git
cd TrackIt
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd client/trackit
npm install

# Install backend dependencies
cd ../../server
npm install
```

### 3. Configure Environment Variables

```bash
# In the server/ directory
cp .env.example .env
```

Fill in the required values (see [Environment Variables](#-environment-variables) below).

### 4. Start MongoDB

**Option A — MongoDB Atlas (recommended for quick start):**
Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) and paste your connection string into `MONGO_URI` in your `.env`.

**Option B — local MongoDB:**
Ensure MongoDB is running locally on port `27017`.

### 5. Seed the Database (Optional)

```bash
cd server
node seed.js
```

### 6. Start the Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client/trackit
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000 (or as configured in `server/config/env.js`)

---

## 🔐 Environment Variables

Create a `.env` file inside `server/`. The variables are loaded via `server/config/env.js`. Use `.env.example` as a reference.

```env
# ─── Database ───────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/trackit

# ─── Auth ───────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# ─── Email (Nodemailer) ─────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@trackit.app

# ─── Slack ──────────────────────────────────────────
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=C0XXXXXXXXX

# ─── App ────────────────────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |

### Events

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/events` | List all published events | Public |
| `GET` | `/api/events/:id` | Get a single event | Public |
| `POST` | `/api/events` | Create a new event | Teacher / Admin |
| `PUT` | `/api/events/:id` | Update event (own events) | Teacher / Admin |
| `DELETE` | `/api/events/:id` | Delete event | Admin |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/pending` | List all pending events | Admin |
| `PATCH` | `/api/admin/events/:id/approve` | Approve an event | Admin |
| `PATCH` | `/api/admin/events/:id/reject` | Reject an event | Admin |
| `GET` | `/api/admin/analytics` | Platform analytics | Admin |

### Applications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/applications` | Save or apply to an event | Student |
| `GET` | `/api/applications/me` | Get my applications | Student |
| `PATCH` | `/api/applications/:id` | Update application status | Student |

### Ratings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ratings` | Submit a rating for an event | Student |
| `GET` | `/api/ratings/:eventId` | Get ratings for an event | Public |

---

## ⏰ Reminder System

The reminder engine runs as a background cron job that checks the database every minute for upcoming deadlines.

### Schedule

| Trigger | Fires |
|---------|-------|
| 7 days before deadline | Weekly heads-up |
| 3 days before deadline | Urgency alert |
| 1 day before deadline | Final day reminder |
| 1 hour before deadline | Last-chance alert |

### How It Works

```
Cron Job runs every minute
          │
          ▼
Queries Reminder table WHERE:
  sent = false AND sendAt <= NOW()
          │
          ▼
For each due reminder:
  ├── Send Email via Nodemailer/Resend
  ├── Send Slack message via Slack Web API
  └── Create in-app notification record
          │
          ▼
Mark reminder as sent = true
```

Reminders are generated automatically when a student saves or applies to an event. They are created for all four time checkpoints relative to the event's `deadline` field.

---

## 🤖 Scam Detection Engine

Every event submission passes through an automated screening layer before it reaches the admin moderation queue.

### Detection Rules

| Check | Logic |
|-------|-------|
| **Suspicious keywords** | Matches against a keyword blocklist (e.g., "guaranteed money", "send fee", "wire transfer") |
| **Short description** | Flags descriptions under a minimum character threshold |
| **Suspicious links** | Validates domain against a list of known phishing/scam domains; flags URL shorteners |
| **Missing eligibility** | Flags events with no stated eligibility criteria |

### Outcome

- If any rule triggers → `isScam = true`, event routed to a special admin review queue
- Admin can then approve (overriding the flag) or reject the event
- Clean events proceed normally to the standard `pending` queue

> ⚠️ **Note:** The scam detection engine is currently rule-based. ML-based classification is planned for a future release.

---

## 🔔 Notification Channels

TrackIt delivers deadline reminders and event updates through three channels:

### Email
Handled via **Nodemailer** (works with any SMTP provider) or **Resend** (recommended). Emails include event title, deadline, and a direct application link.

### Slack
Uses the **Slack Web API** to send formatted messages to a configured channel or directly to a user's Slack DM (if they've linked their Slack account).

### In-App
Notifications are stored in the database and surfaced in the `NotificationBell` component in the navbar. Supports real-time updates.

---

## 🤝 Contributing

Contributions are welcome! Please read the guidelines below before opening a pull request.

### Development Workflow

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git commit -m "feat: describe your change"

# 4. Push and open a pull request
git push origin feature/your-feature-name
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `chore:` | Build, tooling, config |
| `docs:` | Documentation changes |
| `refactor:` | Code changes without new features |
| `test:` | Adding or updating tests |

### Code Style
- JavaScript (ES Modules) throughout — no TypeScript
- ESLint configured via `eslint.config.mjs` (frontend) — run `npm run lint`
- Prettier for consistent formatting
- Mongoose model changes should be reflected in `seed.js` if defaults change

---

## 🗺️ Roadmap

- [ ] ML-based scam detection model
- [ ] OAuth login (Google, GitHub)
- [ ] Mobile app (React Native)
- [ ] Opportunity categories and smart filters
- [ ] Teacher/institution verified badges
- [ ] Weekly digest email of top opportunities
- [ ] Public API for third-party integrations

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ for students who deserve to know about every opportunity.

[Report a Bug](https://github.com/Bolice1/TrackIt/issues) · [Request a Feature](https://github.com/Bolice1/TrackIt/issues) · [Contribute](https://github.com/Bolice1/TrackIt/pulls)

</div>