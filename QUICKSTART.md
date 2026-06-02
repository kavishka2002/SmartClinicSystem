# Quick Start - SmartClinic

## Prerequisites
- Node.js 18+ installed
- `firebase-admin-service-account.json` placed in project root
- `.env.local` configured (already done!)

## Run Development Server

```bash
cd "C:\Users\User\Desktop\Smart Clinic\smart-clinic"
npm install
npm run dev
```

Then open: **http://localhost:3000** → redirects to `/login`

## Build for Production

```bash
npm run build
npm start
```

## Environment Files
- ✅ `.env.local` - Ready to use (development)
- 📄 `.env.example` - Reference template
- ⚠️ **Never commit**: `.env.local`, `firebase-admin-service-account.json`

## Vercel Deployment

1. Add to Vercel dashboard → Environment Variables:
   - All `NEXT_PUBLIC_FIREBASE_*` variables
   - `FIREBASE_ADMIN_CREDENTIALS_PATH` or `FIREBASE_ADMIN_CREDENTIALS`

2. Deploy:
   ```bash
   git push origin main
   ```

## Credentials Location

- **Client-side**: Firebase web config (in `.env.local`)
- **Server-side**: `firebase-admin-service-account.json` (in project root)

## Troubleshooting

### Firebase error on startup?
- Verify `firebase-admin-service-account.json` exists in project root
- Check `.env.local` has correct `FIREBASE_ADMIN_CREDENTIALS_PATH`
- Restart dev server: `npm run dev`

### Port 3000 in use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Authentication not working?
- Verify Firebase Authentication is enabled
- Check Email/Password provider is active
- Ensure user exists in Firebase

---

**Status**: ✅ Ready to develop and deploy

See `SETUP.md` for detailed instructions.
