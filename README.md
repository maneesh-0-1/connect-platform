# AIESEC Conference Networking Platform 2026

A premium, production-ready digital networking system for AIESEC delegates. Each delegate receives a physical card with a unique QR code. Scanning the card allows them to claim their digital profile, which they can edit anytime via OTP login.

## 🌟 Features

- **Admin Portal**: Generate bulk QR codes, download as ZIP (images) or PDF (print-ready), and view live conference stats.
- **QR Claim System**: Secure claiming process binding a physical QR to an AIESEC email.
- **Delegate Profile**: Neo-Glass UI, vCard download, social links, and privacy-controlled phone sharing.
- **Authentication**: OTP-based passwordless login (Gmail SMTP).
- **Security**: Rate limiting, localized data, server-side validation.

## 🚀 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firebase Firestore
- **Utilities**: `qrcode`, `jspdf`, `jszip`, `nodemailer`

## 🛠️ Setup & Deployment

### Prerequisites
1. Node.js 18+
2. Firebase Project (Firestore, Auth enabled)
3. Gmail Account (App Password for SMTP)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/aiesec-connect.git
cd aiesec-connect
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in:
- Firebase Client Certs
- Firebase Service Account (JSON or Base64 encoded)
- SMTP Credentials

### 3. Run Locally
```bash
npm run dev
```

### 4. Deploy to Vercel
1. Import project to Vercel.
2. Add Environment Variables in Vercel Dashboard.
3. Deploy!

## 🔐 Admin Access
Go to `/admin/login`.
Default Creds (Change in code or env):
- Email: `admin@aiesec.net`
- Password: `admin`

## 📱 User Flow
1. **Delegate** receives card.
2. Scans QR -> Redirects to `/claim/[id]`.
3. Enters Email -> Receives 6-digit OTP.
4. Verifies OTP -> Sets up Profile (Name, Bio).
5. **Profile is Live**: `/delegate/email`.
6. To Edit: Go to `/login`, enter email, get OTP, edit profile.

---
Built with ❤️ for AIESEC.
