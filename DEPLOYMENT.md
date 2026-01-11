# Deployment Guide

This guide details how to deploy the AIESEC Connect platform to production using Vercel (Frontend/API) and Firebase (Database/Auth).

## 1. Firebase Setup

### A. Create Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (e.g., `aiesec-connect-2026`).
3. Enable **Google Analytics** (optional).

### B. Firestore Database
1. Go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose a location (e.g., `asia-south1` or `us-central1`).
4. Start in **Production Mode**.
5. Go to the **Rules** tab and paste the following security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile, anyone can read if public phone visibility is handled in code
    // Ideally, "read" is public for "users" collection (for profile view), 
    // but "write" is restricted to the owner.
    
    match /users/{email} {
      allow read: if true; // Public profiles
      allow write: if request.auth != null && request.auth.token.email == email;
    }
    
    // QRs are read-only for public (to check status), Admin write only
    match /qrs/{id} {
      allow read: if true;
      allow write: if false; // Admin SDK only (bypasses rules)
    }
  }
}
```

### C. Authentication
1. Go to **Build > Authentication**.
2. Click **Get Started**.
3. No specific providers needed if using Custom Tokens via Admin SDK, but enabling **Email/Password** is good for debugging.

### D. Service Account
1. Go to **Project Settings > Service Accounts**.
2. Click **Generate new private key**.
3. Save the JSON file. You will need this for the `.env` file (or Base64 encode it).

## 2. Environment Variables

Prepare these variables for Vercel:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase Project Settings > General (Web App) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `project-id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `project-id.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Project Settings |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | The content of the JSON key file (or Base64 string) |
| `SMTP_EMAIL` | Gmail address for sending OTPs |
| `SMTP_PASSWORD` | Gmail App Password (NOT your login password) |
| `ADMIN_PASSWORD` | Password for `/admin/login` (default: `admin`) |

## 3. Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New > Project**.
3. Import your GitHub repository.
4. In **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - **Environment Variables**: Add all variables from step 2.
5. Click **Deploy**.

## 4. Post-Deployment Verification

1. Visit your Vercel URL (e.g., `https://connect.vercel.app`).
2. Go to `/admin/login` and login.
3. Generate a batch of QR codes.
4. Scan one with your phone (it should open the `/qr/XXX` route).
5. Claim it using a real email (to test SMTP).
6. Verify the profile page loads.

## 5. Troubleshooting

- **Email not sending**: Check Gmail "Less Secure Apps" or (better) ensure you are using an **App Password** and 2FA is on.
- **Firebase Permission Denied**: Check Firestore Rules (Step 1B).
- **Build Fails**: Check Vercel logs. Ensure all `NEXT_PUBLIC_` vars are present at build time.
