# Vive AI - Setup & Troubleshooting Guide

## Environment Setup

### Required Environment Variables

The application requires the following environment variables to be set in `.env` file:

```bash
# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://neondb_owner:your-password@ep-your-database-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Authentication
BETTER_AUTH_SECRET="your-better-auth-secret-key"
BETTER_AUTH_URL="http://localhost:3001"

# Google OAuth Configuration (REQUIRED for "Continue with Google")
# 1. Go to: https://console.cloud.google.com/
# 2. Create new project or select existing
# 3. Enable "Google+ API"
# 4. Create OAuth 2.0 Client ID (Web Application)
# 5. Add Authorized Redirect URIs:
#    - http://localhost:3001/api/auth/callback/google (development)
#    - https://yourdomain.com/api/auth/callback/google (production)
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# Server Configuration
PORT=3001

# AI APIs
GEMINI_API_KEY="your-gemini-api-key-here"
COHERE_API_KEY="your-cohere-api-key-here"

# File Storage (Cloudinary)
CLOUDINARY_API_KEY="your-cloudinary-api-key-here"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret-here"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name-here"

# Email Configuration
SMTP_USERNAME="your-smtp-username-here"
SMTP_PASSWORD="your-smtp-app-password-here"
SMTP_FROM_EMAIL="your-smtp-from-email-here"
```

### Setup Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Create/Verify `.env` file**
   - Ensure all required variables from above are set
   - The `.env` file is already in the project (not gitignored)

3. **Run Database Migrations** (if needed)

   ```bash
   npx drizzle-kit push:pg
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Verify Backend is Running**
   - Health Check: `GET http://localhost:3001/health`
   - Ready Check: `GET http://localhost:3001/ready`
   - API Docs: `http://localhost:3001/api/docs`

---

## Troubleshooting 500 Internal Server Errors

### Error: "Failed to load resource: the server responded with a status of 500"

#### Cause 1: Missing DATABASE_URL

**Symptoms:**

- Backend fails to start
- `GET /ready` returns `{"status": "not_ready", "database": "disconnected"}`

**Solution:**

1. Verify `.env` file exists in project root
2. Check `DATABASE_URL` is not empty and valid
3. Ensure Neon database is accessible from your network
4. Restart dev server: `npm run dev`

#### Cause 2: Database Connection Timeout

**Symptoms:**

- `GET /ready` hangs or times out
- Backend logs show connection timeouts

**Solution:**

1. Check your internet connection
2. Verify Neon database URL is correct and not expired
3. Test connection: `psql <DATABASE_URL>`
4. Check Neon dashboard for any issues

#### Cause 3: API Route Error

**Symptoms:**

- Specific endpoints return 500
- Check browser console for which endpoint fails
- Backend logs show error details

**Solution:**

1. Check browser console for the exact endpoint
2. Review backend logs for error messages
3. Run `GET http://localhost:3001/health` to verify server is up
4. Check if specific tables exist in database

#### Cause 4: Missing API Keys

**Symptoms:**

- Specific endpoints fail (AI features, uploads, etc.)
- Error mentions "Missing API Key" or "Missing Gemini API Key"

**Solution:**

1. Update `.env` with required API keys
2. Check which endpoints require which keys:
   - **GEMINI_API_KEY**: AI features (homework generation, text simplification, grading)
   - **COHERE_API_KEY**: Alternative AI fallback
   - **CLOUDINARY\_\***: File uploads
   - **SMTP\_\***: Email notifications

### Debugging Tips

1. **Check Backend Logs**
   - Look for error messages in terminal where `npm run dev` is running
   - Look for stack traces that indicate the problem

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Click on the failed request
   - View response to see error message

3. **Test Specific Endpoints**

   ```bash
   # Test health
   curl http://localhost:3001/health

   # Test database connection
   curl http://localhost:3001/ready

   # Test API documentation
   curl http://localhost:3001/api/docs
   ```

4. **Check Environment Variables**

   ```bash
   # Verify variables are loaded (Linux/Mac)
   env | grep DATABASE_URL

   # Windows PowerShell
   Get-ChildItem env: | Where-Object {$_.Name -like "*DATABASE*"}
   ```

---

## Google OAuth Setup (for "Continue with Google" Button)

The "Continue with Google" button requires OAuth 2.0 credentials from Google Cloud Console.

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name (e.g., "Vive AI Development")
5. Click "CREATE"
6. Wait for project to be created, then select it

### Step 2: Enable Google+ API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on "Google+ API"
4. Click "ENABLE"

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, configure OAuth consent screen first:
   - Choose "External" for user type
   - Fill in required fields (App name, user support email, etc.)
   - Add test users if in development
   - Skip optional scopes
4. Choose application type: **Web application**
5. Name it "Vive AI Dev" (or similar)
6. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
   (For production, also add: `https://yourdomain.com/api/auth/callback/google`)
7. Click "CREATE"

### Step 4: Get Your Credentials

1. After creation, you'll see a dialog with your credentials
2. Copy the **Client ID** and **Client Secret**
3. Update your `.env` file:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id-here"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"
   ```

### Step 5: Restart Dev Server

```bash
npm run dev
```

### Verify OAuth is Configured

Check if Google OAuth is properly configured:

```bash
curl http://localhost:3001/api/oauth-config
```

Should return:
```json
{
  "google": {
    "enabled": true,
    "clientIdSet": true,
    "clientSecretSet": true
  }
}
```

### Troubleshooting Google OAuth

**"Invalid client" or "client_id not found" error:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match the values in Google Cloud Console
- Check that the redirect URI in Google Console matches exactly: `http://localhost:3001/api/auth/callback/google`

**"Continue with Google" button does nothing:**
- Check browser console for errors
- Run `/api/oauth-config` endpoint to verify credentials are set
- Check backend logs for error messages

**Can't create OAuth credentials:**
- Ensure you have billing enabled on Google Cloud project (even free tier works)
- Make sure you're logged in with the correct Google account

---

## Production Deployment (Cloudflare Workers)

When deploying to Cloudflare Workers via Wrangler:

1. **Set Secrets** (for sensitive data):

   ```bash
   wrangler secret put DATABASE_URL
   wrangler secret put GEMINI_API_KEY
   wrangler secret put COHERE_API_KEY
   wrangler secret put CLOUDINARY_API_SECRET
   wrangler secret put BETTER_AUTH_SECRET
   wrangler secret put SMTP_PASSWORD
   ```

2. **Set Environment Variables** in `wrangler.jsonc`:

   ```json
   "vars": {
     "NODE_ENV": "production",
     "PORT": "3001",
     "CLOUDINARY_CLOUD_NAME": "your-cloud-name",
     "CLOUDINARY_API_KEY": "your-api-key",
     "SMTP_USERNAME": "your-email",
     "SMTP_FROM_EMAIL": "your-email"
   }
   ```

3. **Deploy**:
   ```bash
   wrangler deploy
   ```

---

## Common Issues & Solutions

| Issue                                           | Solution                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| "DATABASE_URL must be a Neon connection string" | Add `DATABASE_URL` to `.env` file                                 |
| Connection timeout to database                  | Check Neon dashboard, verify URL, check firewall                  |
| 404 on API endpoints                            | Ensure backend server is running on port 3001                     |
| CORS errors                                     | Backend CORS is configured, check if making cross-origin requests |
| AI features returning 500                       | Verify GEMINI_API_KEY or COHERE_API_KEY in `.env`                 |
| File uploads failing                            | Check CLOUDINARY\_\* variables in `.env`                          |

---

## Quick Links

- **Neon Database**: https://console.neon.tech
- **Google Gemini API**: https://aistudio.google.com/app/apikey
- **Cohere API**: https://dashboard.cohere.com
- **Cloudinary**: https://cloudinary.com/console
- **Swagger API Docs**: http://localhost:3001/api/docs (when running locally)
