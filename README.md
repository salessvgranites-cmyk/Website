# Sri Venkateswara Granites - Website & CMS

This repository contains the source code for the public-facing website and internal Content Management System (CMS) for **Sri Venkateswara Granites**.

The application is a modern, serverless web app built for high performance, ease of use, and low maintenance. It utilizes a stack optimized for generous free tiers, making it extremely cost-effective to run in production.

---

## 🛠 Tech Stack Overview

### **Frontend**
- **React 18 & Vite:** Lightning-fast build tool and frontend framework.
- **Tailwind CSS:** Utility-first CSS framework used for all styling.
- **Lucide React:** Icon library.
- **Wouter:** Lightweight, hook-based routing for React.
- **React Query (@tanstack/react-query):** Used via tRPC to manage server state, caching, and data fetching.
- **Shadcn UI (Customized):** Base components (buttons, inputs, dialogs) that are highly customizable.

### **Backend & API**
- **tRPC:** End-to-end typesafe API without traditional REST boilerplate.
- **Node.js (Serverless):** The backend runs as lightweight, highly scalable Vercel Serverless Functions (`/api/trpc/*`).
- **Drizzle ORM:** Modern, lightweight TypeScript ORM used to interact with the database.

### **Database & Storage**
- **Neon Postgres (neon.tech):** Serverless PostgreSQL database. It separates storage and compute, enabling fast connection times and serverless scaling.
- **Cloudinary:** Cloud-based media management used for hosting all website imagery.

### **Authentication & Integrations**
- **Custom Google OAuth 2.0:** Secure admin authentication locked down to specific emails using Google's OAuth APIs.
- **Nodemailer (Gmail SMTP):** Handles automated email notifications using an App Password.
- **Google Sheets Webhook (Apps Script):** Automatically pushes new customer enquiries directly into a Google Spreadsheet in real-time.

---

## 💸 Free Tier Explanations

The stack was explicitly chosen so the application can run comfortably on free tiers with almost zero monthly costs.

1. **Vercel (Hosting & Backend):** 
   - **Free Hobby Tier** provides fast global CDN hosting, automatic SSL, and 100GB of bandwidth per month. It also covers the serverless function executions needed for the tRPC backend.
2. **Neon Postgres (Database):** 
   - **Free Tier** includes 0.5 GB of storage (more than enough for a CMS text database) and generous compute hours. It idles to zero when not in use.
3. **Cloudinary (Image Hosting):** 
   - **Free Tier** offers 25 monthly "credits" (1 credit = 1000 transformations, 1GB storage, or 1GB bandwidth). This covers thousands of high-quality image serves per month without touching paid plans.
4. **Google Gmail (SMTP):** 
   - **Free Tier:** Standard Gmail accounts allow 500 emails sent per day. Ideal for lead notifications.
5. **Google Cloud Console (OAuth) & Google Sheets:** 
   - Both are entirely **free** to use for this scale.

---

## 🚀 Setting Up the Project (For Developers)

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm
- A Neon Postgres database URL
- A Cloudinary account
- A Google Cloud Console project (for OAuth)

### 2. Environment Variables (`.env`)
Create a `.env` file in the root directory. Here is the template of required variables:

```env
# Database (Neon)
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME="your_cloud_name"
VITE_CLOUDINARY_UPLOAD_PRESET="your_upload_preset"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret"

# Admin configuration
ADMIN_EMAIL="sales.svgranites@gmail.com"
SMTP_PASS="your_16_char_gmail_app_password" # Generated from Google Account Security

# Integrations
GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"

# Application Settings
VITE_APP_URL="http://localhost:3000" # Change to production URL when deployed
JWT_SECRET="a_very_long_secure_random_string"
```

### 3. Installation & Database Setup
```bash
# Install dependencies
npm install

# Push the database schema to Neon
npm run db:push

# Build the API (Required for running locally)
npm run build:api

# Start the local development server
npm run dev
```

---

## ⚙️ Configuration Guides

### 1. Database (Neon Postgres)
1. Go to [Neon.tech](https://neon.tech) and create a project.
2. Copy the **Pooled** connection string.
3. Paste it as `DATABASE_URL` in your `.env`.

### 2. Image Hosting (Cloudinary)
1. Sign up at [Cloudinary](https://cloudinary.com).
2. Note your **Cloud Name**.
3. Go to Settings -> Upload -> **Upload presets**.
4. Create an **unsigned** upload preset. 
5. Put the Cloud Name and Preset name in the `.env` file. The admin dashboard uses this preset to upload images directly to Cloudinary.

### 3. Admin Login (Google OAuth)
1. Go to the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project.
3. Go to **APIs & Services -> Credentials**.
4. Create an **OAuth 2.0 Client ID** (Web application).
5. Add Authorized Redirect URIs:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
6. Copy the Client ID and Secret to your `.env` file.
7. *Security Note:* Ensure `ADMIN_EMAIL` matches the Google account you wish to log in with. The application enforces a strict check against this email to grant Admin Dashboard access.

### 4. Email Notifications (Gmail SMTP)
1. Log in to the Google account matching `ADMIN_EMAIL`.
2. Go to **Manage your Google Account** -> **Security**.
3. Enable **2-Step Verification**.
4. Search for **App passwords**.
5. Create a new App Password (e.g., "Website Mailer").
6. Copy the generated 16-character string (without spaces) and paste it as `SMTP_PASS` in your `.env` file.

### 5. Google Sheets Lead Sync
1. Open a new Google Sheet.
2. Go to **Extensions -> Apps Script**.
3. Write a simple `doPost(e)` function to append the incoming JSON data to the active sheet.
4. Deploy the script as a **Web App** (Execute as: You, Who has access: Anyone).
5. Copy the Web App URL and paste it into the `GOOGLE_SHEETS_WEBHOOK_URL` in your `.env`.

---

## 📦 Deployment (Vercel)

Deploying to Vercel is seamless since the project uses Vite and Serverless Functions (`/api/*`).

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and import the repository.
3. **Crucial:** Go to the Project Settings -> **Environment Variables** in Vercel.
4. Copy all variables from your local `.env` and paste them into Vercel.
   - *Important:* Change `VITE_APP_URL` to your live Vercel domain (e.g., `https://svgranites.vercel.app`).
5. Set the Build Command (if not auto-detected): `npm run build && npm run build:api`
6. Deploy!

---

## 📂 Project Structure Highlights
- `/client/src/pages/Admin.tsx`: The entire frontend codebase for the CMS dashboard.
- `/client/src/pages/Home.tsx`: The public-facing website.
- `/server/db.ts`: Handles all database inserts, updates, and fetches.
- `/server/routers.ts`: The tRPC routers defining the API endpoints and logic.
- `/server/api/auth/google.ts`: Handles the Google OAuth login flow.
- `/shared/schema.ts`: Drizzle ORM database schema definitions.
- `/shared/contentDefaults.ts`: Fallback data for the website layout if the DB is empty.
