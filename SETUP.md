# SmartClinic Environment Setup Guide

## Overview

This document explains how to set up the SmartClinic project with proper environment variable management. All sensitive data (Firebase credentials, API keys, database URLs) are now stored in `.env.local` and excluded from version control.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project created at https://console.firebase.google.com

## Project Structure

```
smart-clinic/
├── .env.example                          # Template for environment variables
├── .env.local                            # Local development environment (NOT in git)
├── .gitignore                            # Excludes .env and credentials files
├── app/
│   ├── lib/
│   │   ├── firebaseConfig.ts            # Uses NEXT_PUBLIC_FIREBASE_* env vars
│   │   ├── firebaseAdmin.ts             # Uses FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
│   │   └── firebaseClient.ts            # Client-side Firebase initialization
│   └── [other files]
└── [other files]
```

**Note**: `firebase-admin-service-account.json` is no longer needed. All credentials are now managed via environment variables for better security and Vercel deployment compatibility.

## Setup Steps

### 1. Clone or Download the Project

```bash
cd "C:\Users\User\Desktop\Smart Clinic\smart-clinic"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Firebase Credentials

#### For Client-side Configuration (NEXT_PUBLIC variables):

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `smart-clinic-system-abb66`
3. Click **Project Settings** (gear icon)
4. Go to **General** tab
5. Copy the Firebase SDK configuration (you'll see firebaseConfig object)
6. Note down these values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `measurementId` → `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

#### For Server-side Configuration (Firebase Admin):

1. Go to Firebase Console → **Project Settings**
2. Navigate to **Service Accounts** tab
3. Click **Generate New Private Key**
4. A JSON file will download automatically
5. Extract these values from the JSON file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (with `\n` escaped as `\\n`)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `client_id` → `FIREBASE_CLIENT_ID`

### 4. Configure Environment Variables

#### Option A: Individual Environment Variables (Recommended for Vercel)

The `.env.local` file should contain individual environment variables:

```env
# Client-side Firebase config (visible in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBrSUVCWW3vcI9ZR7NWHD3S3Vs1ZHML8Cw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smart-clinic-system-abb66.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=smart-clinic-system-abb66
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=smart-clinic-system-abb66.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=833271231389
NEXT_PUBLIC_FIREBASE_APP_ID=1:833271231389:web:f1c03c1f10c766b50b7574
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YJYY4XDJ2F

# Server-side Firebase Admin (NOT visible in browser)
FIREBASE_PROJECT_ID=smart-clinic-system-abb66
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@smart-clinic-system-abb66.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_CLIENT_ID=your_client_id

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Option B: Full Service Account JSON (Alternative)

If you prefer, you can provide the entire service account JSON as a single string:

```env
FIREBASE_ADMIN_CREDENTIALS={"type":"service_account","project_id":"smart-clinic-system-abb66","private_key":"...","client_email":"..."}
```

### 5. For Vercel Production Deployment

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all `NEXT_PUBLIC_FIREBASE_*` variables (same as in `.env.local`)
4. Add the Firebase Admin credentials using ONE of these options:

**Option A: Individual Environment Variables (Recommended)**
```
FIREBASE_PROJECT_ID=smart-clinic-system-abb66
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@smart-clinic-system-abb66.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_CLIENT_ID=your_client_id
```

**Option B: Full Service Account JSON (Alternative)**
```
FIREBASE_ADMIN_CREDENTIALS={"type":"service_account","project_id":"smart-clinic-system-abb66","private_key":"...","client_email":"..."}
```

**Note**: The individual environment variable approach (Option A) is recommended because Vercel environment variables don't need special escaping for multiline values when set individually.

### 6. Verify Firebase Setup

Ensure these are enabled in Firebase Console for project `smart-clinic-system-abb66`:

1. **Authentication**: Email/Password sign-in enabled
2. **Firestore Database**: Created and rules configured
3. **Storage**: Created (if using file uploads)

### 7. Start Development Server

```bash
npm run dev
```

The app should open at `http://localhost:3000` and redirect to `/login`.

### 8. Build for Production

```bash
npm run build
npm start
```

## Environment Variables Reference

### NEXT_PUBLIC_* (Exposed to Browser)

These variables are publicly visible and safe to expose. They identify your Firebase project but do NOT contain secrets.

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public API key for Firebase | `AIzaSyBrSUVCWW...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `smart-clinic-system-abb66.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `smart-clinic-system-abb66` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `smart-clinic-system-abb66.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | `833271231389` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:833271231389:web:...` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID | `G-YJYY4XDJ2F` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

### Private Variables (Server-side Only)

These variables are NOT accessible from the browser and are secure.

| Variable | Purpose | Example |
|----------|---------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | `smart-clinic-system-abb66` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk-xxxxx@smart-clinic-system-abb66.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key (with `\n` escaped) | `-----BEGIN PRIVATE KEY-----\nMIIEv...` |
| `FIREBASE_PRIVATE_KEY_ID` | Private key ID | `xxxxxxxxxxxxx` |
| `FIREBASE_CLIENT_ID` | Firebase client ID | `xxxxxxxxxxxxx` |
| `FIREBASE_ADMIN_CREDENTIALS` | Full service account as JSON string (alternative) | `{"type":"service_account",...}` |
| `NODE_ENV` | Environment name | `development` or `production` |

## Important Security Notes

### ✅ DO's

- ✅ Keep `.env.local` and `firebase-admin-service-account.json` in `.gitignore`
- ✅ Never commit sensitive files to Git
- ✅ Use `NEXT_PUBLIC_` prefix only for non-sensitive data
- ✅ Regenerate Firebase credentials if accidentally committed
- ✅ Use strong passwords for Firebase authentication
- ✅ Enable Firestore security rules before production

### ❌ DON'Ts

- ❌ Do NOT commit `.env.local` or service account JSON
- ❌ Do NOT hardcode credentials in source code
- ❌ Do NOT share `.env.local` or credentials publicly
- ❌ Do NOT use the same credentials for multiple projects
- ❌ Do NOT expose private API keys in client-side code

## Troubleshooting

### "Firebase Admin initialization failed"

**Problem**: Application fails to start with Firebase Admin error.

**Solution**:
1. Verify all Firebase Admin environment variables are set in `.env.local`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
2. Check that `FIREBASE_PRIVATE_KEY` has proper newline escaping (with `\\n`)
3. Alternatively, verify `FIREBASE_ADMIN_CREDENTIALS` JSON string is valid
4. Regenerate the service account credentials from Firebase Console if needed

### Environment variables not loading

**Problem**: `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` returns `undefined`.

**Solution**:
1. Ensure `.env.local` exists in project root (same directory as `package.json`)
2. Verify variable names have correct `NEXT_PUBLIC_` prefix
3. Restart the dev server: `npm run dev`
4. Check that `.env.local` is NOT in `.gitignore` (only sensitive files should be)

### "Unauthorized" errors when accessing protected routes

**Problem**: Authentication fails despite correct credentials.

**Solution**:
1. Verify Firebase Authentication is enabled in Console
2. Check Email/Password sign-in provider is enabled
3. Ensure user exists in Firebase Authentication
4. Verify JWT cookie is being set (check browser DevTools → Application → Cookies)

### Port already in use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows (find PID, then: taskkill /PID <PID> /F)
```

## File Checklist

Before deploying, ensure these files exist and are properly configured:

- [ ] `.env.local` - Contains all Firebase credentials (NOT in Git)
- [ ] `.env.example` - Template for environment variables (in Git)
- [ ] `.gitignore` - Includes `.env*` and credential files
- [ ] `app/lib/firebaseConfig.ts` - Uses `process.env.NEXT_PUBLIC_*` variables
- [ ] `app/lib/firebaseAdmin.ts` - Uses `process.env.FIREBASE_*` environment variables
- [ ] `package.json` - All dependencies installed
- [ ] `next.config.ts` - Next.js configuration

## Commands Reference

```bash
# Install dependencies
npm install

# Start development server (uses .env.local)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Build and start in one command
npm run build && npm start
```

## Getting Help

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
3. Check build output for specific error messages
4. Verify all files are in the correct location

## Next Steps

After setup:

1. Create test user accounts in Firebase Authentication
2. Configure Firestore security rules for production
3. Enable HTTPS for production deployment
4. Set up database backups in Firebase Console
5. Configure custom domain on Vercel (if deploying to production)

---

**Last Updated**: June 2, 2026  
**Project**: SmartClinic Healthcare Management System
