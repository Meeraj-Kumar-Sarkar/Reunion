# 🎓 Reunion — Alumni Contribution & Admin Portal

> A full-stack, zero-transaction-fee alumni fundraising platform built for school/college reunions. Alumni contribute via UPI QR codes, and administrators manage, verify, and track all contributions through a dedicated dashboard.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Directory Structure](#directory-structure)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Customizing for Your Organization](#customizing-for-your-organization)
  - [Branding and Text](#1-branding-and-text)
  - [UPI Payment Details](#2-upi-payment-details)
  - [Exam Types and Year Range](#3-exam-types-and-year-range)
  - [Language Support](#4-language-support)
  - [Email Notifications](#5-email-notifications)
  - [Admin Authentication](#6-admin-authentication)
  - [CORS and Allowed Origins](#7-cors-and-allowed-origins)
- [Deployment](#deployment)
- [Security Notes](#security-notes)

---

## Overview

**Reunion** is a purpose-built web application for alumni associations who want to collect contributions from former students for events like golden jubilees, reunions, or endowment funds — **without paying any payment gateway transaction fees**.

Instead of a traditional payment gateway, it uses **UPI QR codes** (India's Unified Payments Interface). Alumni scan the QR code using any UPI app (Google Pay, PhonePe, Paytm, etc.) and complete the transfer directly to the organization's UPI ID. They then self-report their payment, which is saved to the database as `pending`. An admin then manually verifies the payment and marks it as `verified`, which triggers an automated confirmation email to the contributor.

The project is split into **three independent sub-modules**:

| Module | Description |
|---|---|
| `alumni-payment/client` | Public-facing contributor portal (React + Vite) |
| `alumni-payment/server` | Backend REST API (Node.js + Express + MongoDB) |
| `alumni-admin` | Admin dashboard (React + Vite + Tailwind CSS) |

---

## Project Architecture

```
Reunion/
├── alumni-payment/
│   ├── client/          # Public contributor frontend
│   └── server/          # Shared REST API backend
└── alumni-admin/        # Private admin dashboard frontend
```

The two frontends (`client` and `alumni-admin`) are completely separate Vite apps that both communicate with the **same backend server** (`alumni-payment/server`). This allows them to be deployed independently to different URLs, with the admin portal kept private.

```
             +---------------------------+
             |  alumni-payment/client    |  (Public)
             |  e.g. reunion.example.com |
             +------------+--------------+
                          |
                          v  HTTP (Axios)
             +---------------------------+
             |  alumni-payment/server    |  (API — Port 5000)
             |  Express + MongoDB        |<----------+
             +---------------------------+           |
                                                    | HTTP (Axios)
             +---------------------------+           |
             |       alumni-admin        |  (Private)|
             |  e.g. admin.example.com   |-----------+
             +---------------------------+
```

---

## Tech Stack

### Frontend (both `client` and `alumni-admin`)

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.x | HTTP client |
| react-hot-toast | 2.x | Toast notifications |
| Lucide React | 1.x | Icon library (admin only) |
| react-qr-code | 2.x | QR code generation (client only) |
| Framer Motion | 12.x | Animations (client only) |

### Backend (`alumni-payment/server`)

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5 | Web framework |
| Mongoose | 9 | MongoDB ODM |
| Resend | 6 | Transactional email delivery |
| Nodemailer | 8 | Email transport (legacy/fallback) |
| dotenv | 17 | Environment variable management |
| cors | 2 | Cross-Origin Resource Sharing |
| nodemon | 3 | Dev auto-restart |

### Database

- **MongoDB** (via MongoDB Atlas or any self-hosted MongoDB instance)

---

## Features

### Public Contributor Portal (`alumni-payment/client`)

- 📋 **Multi-step contribution form** — collects name, email, exam type, passout year, and amount
- 📱 **Smart UPI Payment** — generates a QR code for desktop users; shows deep-links to Google Pay, PhonePe, Paytm, and any generic UPI app on mobile
- 🌐 **Bilingual UI** — English and Bengali (বাংলা) language toggle
- ✅ **Strict input validation** — RFC 5322 email validation, required fields, positive amounts
- 🔒 **Funding kill-switch** — automatically shows a "Contributions Closed" screen when disabled by admin
- ♿ **Accessible** — ARIA roles, focus management across the multi-step flow
- 📱 **Responsive** — optimized for both mobile and desktop

### Admin Dashboard (`alumni-admin`)

- 🔐 **Password-protected** — token-based session authentication (stored in `sessionStorage`)
- 📊 **Real-time statistics** — total contributors, total amount raised, pending & verified counts
- 🔍 **Search & filter** — filter by name, email, or status (pending / verified)
- ✅ **One-click verification** — marks a contribution as verified and sends confirmation email
- ➕ **Manual entry** — admin can add contribution records directly
- ✏️ **Edit & Delete** — full CRUD on all contributions
- 🚫 **Portal kill-switch** — toggle to open/close the public contribution portal
- 🌐 **Bilingual UI** — English and Bengali toggle

### Backend API

- RESTful architecture with structured route groupings
- Graceful MongoDB connection (server starts even if DB is temporarily unreachable)
- CORS whitelist covering production and local development origins
- Automated verification email via Resend when a contribution is marked verified
- Health check endpoint at `GET /health`

---

## Directory Structure

```
Reunion/
│
├── alumni-payment/
│   │
│   ├── client/                        # Contributor-facing frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Navbar.jsx         # Top navigation bar
│   │   │   │   ├── Hero.jsx           # Landing hero section
│   │   │   │   ├── PaymentForm.jsx    # Core 2-step payment form + QR
│   │   │   │   ├── PaymentSuccess.jsx # Post-payment success message
│   │   │   │   └── Footer.jsx         # Site footer
│   │   │   ├── pages/
│   │   │   │   └── Home.jsx           # Main page composition
│   │   │   ├── context/
│   │   │   │   └── LanguageContext.jsx # i18n provider (EN/BN)
│   │   │   ├── services/
│   │   │   │   └── api.js             # Axios instance + API calls
│   │   │   ├── App.jsx                # Router setup
│   │   │   └── main.jsx               # React entry point
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── server/                        # Backend API
│       ├── config/
│       │   └── db.js                  # MongoDB connection
│       ├── controllers/
│       │   ├── paymentController.js   # Public payment endpoints
│       │   └── adminController.js     # Admin CRUD endpoints
│       ├── middleware/
│       │   └── adminAuth.js           # Bearer token auth guard
│       ├── models/
│       │   ├── Contribution.js        # Mongoose contribution schema
│       │   └── SystemSetting.js       # Key-value settings schema
│       ├── routes/
│       │   ├── paymentRoutes.js       # /api/payments/*
│       │   └── adminRoutes.js         # /api/admin/*
│       ├── utils/
│       │   └── email.js               # Resend email utility
│       ├── server.js                  # Express app entry point
│       ├── .env.example
│       └── package.json
│
└── alumni-admin/                      # Admin dashboard frontend
    ├── src/
    │   ├── pages/
    │   │   ├── AdminLogin.jsx         # Login screen
    │   │   └── AdminDashboard.jsx     # Full dashboard (stats, table, modals)
    │   ├── context/
    │   │   └── LanguageContext.jsx    # i18n provider (EN/BN)
    │   ├── services/
    │   │   └── adminApi.js            # Axios instance + all admin API calls
    │   ├── App.jsx                    # Router setup
    │   └── main.jsx                   # React entry point
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

---

## How It Works

### Contributor Flow

1. Alumni visit the public portal and fill out the contribution form (name, email, exam type, passout year, amount).
2. The app validates inputs and advances to **Step 2** — the payment screen.
3. On **desktop**: a UPI QR code is generated client-side using the entered amount and the organization's UPI ID.
4. On **mobile**: deep-link buttons for Google Pay, PhonePe, Paytm, and a generic UPI option launch the respective payment app directly.
5. After completing the payment in their UPI app, the alumni click **"I've Paid"**.
6. The form data (name, email, amount, etc.) is sent to `POST /api/payments/verify`, saving a record to MongoDB with `status: "pending"`.

### Admin Verification Flow

1. Admin logs into the private dashboard with the admin password.
2. The dashboard fetches all contributions via `GET /api/admin/contributions`.
3. Admin manually cross-checks the UPI transaction in their bank statement or UPI app.
4. Clicking **Verify** on a record calls `PATCH /api/admin/contributions/:id/verify`.
5. The backend marks the record as `status: "verified"` and fires a confirmation email to the contributor via Resend.

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **pnpm** (preferred) or npm/yarn — install with `npm install -g pnpm`
- A **MongoDB** database (MongoDB Atlas free tier works perfectly)
- A **Resend** account for transactional emails — [resend.com](https://resend.com)
- A **UPI ID** to receive contributions (e.g., `yourname@sbi` or `yourbusiness@okaxis`)

### Environment Variables

Copy the `.env.example` files and fill in your values.

#### `alumni-payment/server/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/reunion
CLIENT_URL=http://localhost:5173
EMAIL_USER=your-email@example.com
GOOGLE_APP_PASSWORD=your-google-app-password
ADMIN_PASSWORD=your-secure-admin-password
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default: `5000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLIENT_URL` | The deployed URL of the public contributor portal |
| `EMAIL_USER` | Gmail address (used for Nodemailer fallback) |
| `GOOGLE_APP_PASSWORD` | Gmail App Password for Nodemailer |
| `ADMIN_PASSWORD` | Password used to log into the admin dashboard |
| `RESEND_API_KEY` | API key from your Resend account |

#### `alumni-payment/client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_UPI_ID=yourname@bank
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend server |
| `VITE_UPI_ID` | UPI ID where contributions will be received (used to generate QR) |

#### `alumni-admin/.env`

```env
VITE_API_URL=http://localhost:5000
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend server |

### Installation

Open **three separate terminals**:

**Terminal 1 — Backend Server:**
```bash
cd alumni-payment/server
pnpm install
```

**Terminal 2 — Contributor Frontend:**
```bash
cd alumni-payment/client
pnpm install
```

**Terminal 3 — Admin Dashboard:**
```bash
cd alumni-admin
pnpm install
```

### Running Locally

**Terminal 1 — Start the backend:**
```bash
cd alumni-payment/server
pnpm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Start the contributor portal:**
```bash
cd alumni-payment/client
pnpm run dev
# App starts on http://localhost:5173
```

**Terminal 3 — Start the admin dashboard:**
```bash
cd alumni-admin
pnpm run dev
# App starts on http://localhost:5174
```

---

## API Reference

All endpoints are prefixed by the base URL (e.g., `http://localhost:5000`).

### Public Endpoints (`/api/payments/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/payments/status` | Returns `{ fundingActive: boolean }` — whether contributions are currently open |
| `POST` | `/api/payments/order` | Legacy stub; the static QR flow does not require this |
| `POST` | `/api/payments/verify` | Saves a new contribution record with `status: "pending"` |

**`POST /api/payments/verify` — Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "amount": 1000,
  "examType": "HS",
  "passoutYear": 2010,
  "transactionRef": "ALUMNI-1718000000000"
}
```

### Admin Endpoints (`/api/admin/`)

All admin routes (except `/login`) require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/login` | No | Returns a session token for the admin password |
| `GET` | `/api/admin/contributions` | Yes | Lists all contributions; supports `?status=` and `?search=` query params |
| `POST` | `/api/admin/contributions` | Yes | Manually creates a contribution record |
| `PUT` | `/api/admin/contributions/:id` | Yes | Updates any field of a contribution |
| `PATCH` | `/api/admin/contributions/:id/verify` | Yes | Marks as verified and sends confirmation email |
| `DELETE` | `/api/admin/contributions/:id` | Yes | Permanently deletes a contribution |
| `GET` | `/api/admin/settings/funding-status` | Yes | Gets the current open/closed state of the portal |
| `PATCH` | `/api/admin/settings/funding-status` | Yes | Toggles the portal open or closed |

**`GET /api/admin/contributions` — Response:**
```json
{
  "contributions": [ { "_id": "...", "name": "...", "status": "pending", ... } ],
  "stats": {
    "total": 42,
    "totalAmount": 125000,
    "pending": 10,
    "verified": 32
  }
}
```

---

## Customizing for Your Organization

This project was built for **BNGHS Golden Jubilee Celebration**, but it is fully adaptable. Here is exactly what to change for your own use case.

---

### 1. Branding and Text

All visible text strings are managed via a simple key-value translation system inside the `LanguageContext.jsx` files.

- **Contributor portal:** `alumni-payment/client/src/context/LanguageContext.jsx`
- **Admin portal:** `alumni-admin/src/context/LanguageContext.jsx`

Find the `translations` object and update the English values:

```js
const translations = {
  en: {
    navbarTitle: "BNGHS GOLDEN JUBILEE",       // <- Change to your event name
    navbarSubtitle: "CELEBRATION",              // <- Update subtitle
    heroDesc: "Join hands with fellow alumni...", // <- Your custom description
    copyright: "BNGHS GOLDEN JUBILEE CELEBRATION. All rights reserved.", // <- Update
    // ... all other UI strings follow the same pattern
  },
};
```

**SEO meta tags** (page title, description, Open Graph) are located in:
- `alumni-payment/client/index.html`
- `alumni-admin/index.html`

Update the `<title>`, `<meta name="description">`, and Open Graph `<meta>` tags to match your organization.

---

### 2. UPI Payment Details

The UPI ID that receives money is controlled by a single environment variable:

**`alumni-payment/client/.env`**
```env
VITE_UPI_ID=yourname@sbi
```

This value is used to:
- Generate the UPI QR code shown to desktop users
- Build deep-links for Google Pay, PhonePe, and Paytm on mobile

The payee name embedded in the QR/deep-links is currently hardcoded as `"AlumniFund"`. To change it, edit `alumni-payment/client/src/components/PaymentForm.jsx` around **line 91**:

```js
// Before:
const pn = encodeURIComponent("AlumniFund");

// After:
const pn = encodeURIComponent("Your Organization Name");
```

---

### 3. Exam Types and Year Range

The contribution form collects the alumni's exam type and passout year. Defaults:
- Exam types: **HS** and **Madhyamik**
- Year range: **1977 to current year**

**To change exam types**, edit `alumni-payment/client/src/components/PaymentForm.jsx` around **line 398**:

```jsx
// Before:
<option value="HS">HS</option>
<option value="Madhyamik">Madhyamik</option>

// After — replace with your categories:
<option value="Class 12">Class 12</option>
<option value="Class 10">Class 10</option>
<option value="Graduation">Graduation</option>
```

Also update the same dropdown in `alumni-admin/src/pages/AdminDashboard.jsx` inside the add/edit modal.

**To change the start year:**

In `alumni-payment/client/src/components/PaymentForm.jsx`:
```js
// Before:
for (let year = 1977; year <= currentYear; year++) {

// After — use your institution's founding year:
for (let year = 1990; year <= currentYear; year++) {
```

In `alumni-admin/src/pages/AdminDashboard.jsx`:
```js
// Before:
const YEAR_START = 1977;

// After:
const YEAR_START = 1990;
```

---

### 4. Language Support

The project ships with **English** and **Bengali**. To add another language (e.g., Hindi):

1. Open both `LanguageContext.jsx` files and add a new language block:
   ```js
   const translations = {
     en: { /* ... */ },
     bn: { /* ... */ },
     hi: {                              // <- Add Hindi
       navbarTitle: "आपका इवेंट नाम",
       navbarSubtitle: "जश्न",
       // ... translate all the same keys
     },
   };
   ```

2. Update `toggleLanguage` to cycle through your languages:
   ```js
   const toggleLanguage = () => {
     const langs = ["en", "bn", "hi"];
     const nextIndex = (langs.indexOf(lang) + 1) % langs.length;
     const nextLang = langs[nextIndex];
     setLang(nextLang);
     localStorage.setItem("adminLanguage", nextLang);
   };
   ```

To **remove the language toggle** entirely, delete the toggle `<button>` from the `Navbar.jsx` / header component.

---

### 5. Email Notifications

Emails are sent via **Resend** ([resend.com](https://resend.com)). The template is defined in `alumni-payment/server/utils/email.js`.

**To customize the email body**, edit the `html` string inside `sendVerificationEmail()`.

**To change the sender address** (requires a domain verified on Resend):
```js
// Before:
from: "AlumniFund <no-reply@bnghsreunion.com>",

// After:
from: "Your Fund Name <no-reply@yourdomain.com>",
```

**To change the subject line:**
```js
subject: "Your Contribution Has Been Verified!",  // <- Edit this
```

**To switch from Resend to Nodemailer (Gmail):**

Replace the body of `email.js` with:
```js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, name, amount) => {
  await transporter.sendMail({
    from: `"Your Fund" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Contribution Has Been Verified!",
    html: `<p>Dear ${name}, your contribution of ₹${Number(amount).toFixed(2)} has been verified. Thank you!</p>`,
  });
};
```

---

### 6. Admin Authentication

The current authentication uses a single shared password stored as an environment variable. The password is base64-encoded into a session token. **This is simple and sufficient for a small event, but is not recommended for multi-admin production use.**

**To change the admin password**, update `ADMIN_PASSWORD` in `alumni-payment/server/.env` and redeploy.

**To upgrade to JWT-based auth** (recommended for production):

1. Install the package:
   ```bash
   pnpm add jsonwebtoken
   ```

2. Update `alumni-payment/server/controllers/adminController.js`:
   ```js
   import jwt from 'jsonwebtoken';

   const login = async (req, res) => {
     const { password } = req.body;
     if (password !== process.env.ADMIN_PASSWORD) {
       return res.status(401).json({ message: 'Invalid credentials' });
     }
     // Sign a JWT that expires in 8 hours
     const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
     res.json({ token });
   };
   ```

3. Update `alumni-payment/server/middleware/adminAuth.js`:
   ```js
   import jwt from 'jsonwebtoken';

   const adminAuth = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ message: 'Unauthorized: No token' });
     try {
       jwt.verify(token, process.env.JWT_SECRET);
       next();
     } catch {
       res.status(401).json({ message: 'Unauthorized: Invalid token' });
     }
   };

   export default adminAuth;
   ```

4. Add `JWT_SECRET=your-random-secret-key` to `alumni-payment/server/.env`.

---

### 7. CORS and Allowed Origins

When deploying to production, update the CORS whitelist in `alumni-payment/server/server.js`:

```js
// Before:
const allowedOrigins = [
  'https://reunion-tgrf.onrender.com',
  'https://reunion-admin.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
];

// After — replace with your actual deployed frontend URLs:
const allowedOrigins = [
  'https://your-contributor-portal.vercel.app',
  'https://your-admin-panel.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];
```

---

## Deployment

### Recommended Setup

| Module | Recommended Platform | Notes |
|---|---|---|
| `alumni-payment/client` | Vercel / Netlify | Set env vars in platform dashboard |
| `alumni-admin` | Vercel / Netlify | Deploy as a **separate project**; keep URL private |
| `alumni-payment/server` | Render / Railway | Set all server env vars in the dashboard |
| Database | MongoDB Atlas | Free M0 cluster is sufficient for small events |
| Email | Resend | Free tier: 3,000 emails/month |

### Steps

1. **Deploy the backend** to Render (or similar). Copy the deployed URL (e.g., `https://your-api.onrender.com`).
2. **Update CORS** in `server.js` to include your production frontend URLs.
3. **Deploy the contributor portal** to Vercel/Netlify with:
   - `VITE_API_URL` = your backend URL
   - `VITE_UPI_ID` = your UPI ID
4. **Deploy the admin dashboard** to Vercel/Netlify as a **separate project** with:
   - `VITE_API_URL` = your backend URL

### Building for Production

```bash
# Contributor portal
cd alumni-payment/client
pnpm run build    # Output: /dist

# Admin dashboard
cd alumni-admin
pnpm run build    # Output: /dist

# Backend — no build step needed
cd alumni-payment/server
pnpm run start    # Runs server.js directly with Node
```

---

## Security Notes

- 🔑 **Admin token**: The current base64 scheme is not encryption. For higher-security scenarios, upgrade to JWT (see [Section 6](#6-admin-authentication)).
- 🚫 **Manual UPI verification**: The system relies on admin cross-checking the bank statement. There is no automated payment confirmation from UPI networks.
- 🔐 **Environment variables**: Never commit `.env` files. Use `.env.example` as a template only.
- 🌐 **CORS**: Keep the production origin whitelist minimal — only include your actual deployed URLs.
- 📧 **Email domain**: Use a verified custom domain on Resend to avoid confirmation emails landing in spam.

---

*Built with ❤️ for the BNGHS Alumni Community.*
