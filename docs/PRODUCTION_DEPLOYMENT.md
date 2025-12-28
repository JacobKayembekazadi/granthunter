# GrantHunter Production Deployment Checklist

## 🎯 Goal
Deploy GrantHunter to production on Vercel with full Inngest integration.

**Time Required**: ~20-30 minutes  
**Cost**: $0 (using free tiers)

---

## 📋 Pre-Deployment Checklist

Before starting, make sure you have:
- [ ] All code committed locally
- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Inngest account (sign up at https://inngest.com)
- [ ] All API keys from `.env.local` ready to copy

---

# PART 1: PUSH TO GITHUB (5 minutes)

## Step 1: Initialize Git (if needed)

```bash
cd c:\Users\jacob\Downloads\govconAI\granthunter2

# Check if git is initialized
git status

# If not initialized:
git init
```

## Step 2: Create .gitignore (Already exists, verify)

Make sure `.env.local` is in `.gitignore`:
```bash
# Check .gitignore contains:
.env.local
.env*.local
node_modules
.next
```

## Step 3: Commit All Code

```bash
# Add all files
git add .

# Commit
git commit -m "Production deployment: GrantHunter v1.0"
```

## Step 4: Create GitHub Repository

### Option A: Via GitHub Website
1. Go to https://github.com/new
2. **Repository name**: `granthunter2` (or `granthunter`)
3. **Description**: "AI-powered government contracting proposal system"
4. **Visibility**: Private (recommended) or Public
5. Click **"Create repository"**

### Option B: Via GitHub CLI (if installed)
```bash
gh repo create granthunter2 --private --source=. --remote=origin --push
```

## Step 5: Push to GitHub

```bash
# If using GitHub website:
git remote add origin https://github.com/YOUR_USERNAME/granthunter2.git
git branch -M main
git push -u origin main

# If you used gh CLI, already done!
```

**✅ Checkpoint**: Verify code is on GitHub at https://github.com/YOUR_USERNAME/granthunter2

---

# PART 2: INNGEST SETUP (10 minutes)

## Step 6: Connect Inngest to Vercel

1. **In Inngest Dashboard** (where you are now)
2. Click **"Connect Inngest to Vercel"**
3. Click **"Authorize"** when Vercel asks for permission
4. Select your Vercel account/organization
5. Click **"Install"**

**✅ Checkpoint**: You should see "Connected to Vercel" status

## Step 7: Get Inngest Production Keys

### 7A: Get Event Key
1. In Inngest Dashboard → Left sidebar → **"Settings"** or **"Keys"**
2. Find **"Event Keys"** section
3. Look for key starting with `inngest_event_key_prod_`
4. Click **"Copy"** or **"Reveal and Copy"**
5. **Save it somewhere** (Notepad, etc.)

### 7B: Get Signing Key
1. Still in Settings/Keys
2. Find **"Signing Keys"** or **"Production Keys"**
3. Look for key starting with `signkey-prod-v1-`
4. Click **"Copy"** or **"Reveal and Copy"**
5. **Save it somewhere**

**✅ Checkpoint**: You now have both Inngest keys saved

---

# PART 3: VERCEL DEPLOYMENT (15 minutes)

## Step 8: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **GitHub**
4. Find and select your **`granthunter2`** repo
5. Click **"Import"**

## Step 9: Configure Project Settings

### 9A: Framework Preset
- **Framework**: Next.js (should auto-detect)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)

### 9B: Environment Variables (CRITICAL!)

Click **"Environment Variables"** and add ALL of these:

#### Supabase (4 variables)
```
NEXT_PUBLIC_SUPABASE_URL
  → https://qagyzxxamjwpqsqwqjth.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
  → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3l6eHhhbWp3cHFzcXdxanRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTUwMDksImV4cCI6MjA1MDQ5MTAwOX0.LcZPzlKxITuQSXVGZsm5FnUaQAD6S_4qmcH0a5AhHu0

SUPABASE_SERVICE_ROLE_KEY
  → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3l6eHhhbWp3cHFzcXdxanRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDkxNTAwOSwiZXhwIjoyMDUwNDkxMDA5fQ.Bc6Lq5EtQPJW7y0xP_MHqb3O8Zuk08T5dqnPtljqbLA

DATABASE_URL
  → postgresql://postgres.qagyzxxamjwpqsqwqjth:[YOUR_DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

#### Gemini AI (2 variables)
```
GEMINI_API_KEY
  → AIzaSyCSLlthr_RcWJ2LouKz03PCtsX3uDQujO0

NEXT_PUBLIC_GEMINI_API_KEY
  → AIzaSyCSLlthr_RcWJ2LouKz03PCtsX3uDQujO0
```

#### SAM.gov (1 variable)
```
SAM_GOV_API_KEY
  → ypyfT4zAQw75wlVhDlEMkxhWU5UM1z7TZGqU1DDE
```

#### Inngest (2 variables) - USE YOUR PRODUCTION KEYS
```
INNGEST_EVENT_KEY
  → [Paste the Event Key from Step 7A]

INNGEST_SIGNING_KEY
  → [Paste the Signing Key from Step 7B]
```

#### Optional (Can add later):
```
UPSTASH_REDIS_REST_URL
  → (leave blank for now)

UPSTASH_REDIS_REST_TOKEN
  → (leave blank for now)

ANTHROPIC_API_KEY
  → (leave blank for now)

DEEPSEEK_API_KEY
  → (leave blank for now)

OPENAI_API_KEY
  → (leave blank for now)
```

**⚠️ IMPORTANT**: 
- For each variable, check **"Production"**, **"Preview"**, and **"Development"** boxes
- Or just check **"All"** to apply to all environments

## Step 10: Deploy!

1. **Double-check** all environment variables are entered correctly
2. Click **"Deploy"**
3. Wait 2-5 minutes for build to complete
4. You'll see a **"Congratulations!"** screen when done

**✅ Checkpoint**: Build succeeded, you have a production URL

---

# PART 4: VERIFICATION (5 minutes)

## Step 11: Test Production Deployment

### 11A: Visit Your Production URL
1. Copy your Vercel URL (like `https://granthunter2.vercel.app`)
2. Open it in a browser
3. You should see the GrantHunter landing page

### 11B: Test Login
1. Click **"Sign In"** (from landing page)
2. Use your Supabase credentials
3. Should redirect to dashboard

### 11C: Test Dashboard
1. Dashboard should load
2. You should see insights (AI-generated or fallback)
3. No errors in browser console

## Step 12: Verify Inngest Connection

1. Go to https://app.inngest.com
2. Click **"Functions"** in left sidebar
3. You should see **3 functions**:
   - `app/opportunities.scan`
   - `app/proposal.generate`
   - `app/documents.embed`
4. Status should show **"Synced"** or **"Active"**

**✅ Checkpoint**: Functions are visible and synced

## Step 13: Verify Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Verify all 9+ variables are present
4. Click **"Redeploy"** if you added any after initial deployment

---

# PART 5: OPTIONAL ENHANCEMENTS (Later)

## Add Custom Domain (Optional)
1. In Vercel → **Domains**
2. Add your custom domain
3. Update DNS records

## Add Redis (Upstash) for Caching
1. Sign up at https://upstash.com
2. Create Redis database
3. Copy REST URL and Token
4. Add to Vercel environment variables
5. Redeploy

## Add Claude for Better Editing
1. Sign up at https://console.anthropic.com
2. Get API key
3. Add `ANTHROPIC_API_KEY` to Vercel
4. Redeploy

---

# TROUBLESHOOTING

## Build Failed?

### Error: "Missing environment variable"
**Solution**: Go to Vercel Settings → Environment Variables, add the missing one, redeploy

### Error: "Module not found"
**Solution**: Make sure `package.json` is committed and all dependencies are listed

### Error: "Database connection failed"
**Solution**: Check `DATABASE_URL` is correct, including password

## Deployed but Pages Blank?

### Check Vercel Logs
1. In Vercel → Your project → **"Deployments"**
2. Click latest deployment
3. Click **"Functions"** to see logs
4. Look for errors

### Check Browser Console
1. Open your production site
2. Press F12 → Console tab
3. Look for JavaScript errors

## Inngest Functions Not Showing?

### Verify Webhook
1. In Inngest → **Webhooks**
2. Should see your Vercel URL: `https://granthunter2.vercel.app/api/inngest`
3. If not, click **"Add Webhook"** and enter it

### Manually Sync
1. In Vercel, redeploy the project
2. In Inngest, wait 1-2 minutes for auto-sync
3. Refresh Functions page

---

# ✅ FINAL CHECKLIST

After completing all steps, you should have:

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] All 9+ environment variables set in Vercel
- [ ] Production URL working (e.g., https://granthunter2.vercel.app)
- [ ] Login working via Supabase Auth
- [ ] Dashboard loading with insights
- [ ] Inngest functions synced (3 functions visible)
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs

---

# 🎉 SUCCESS METRICS

Your production system is ready when:
- ✅ Can visit production URL
- ✅ Can log in
- ✅ Dashboard shows insights
- ✅ No 500 errors
- ✅ Inngest shows 3 synced functions
- ✅ Can trigger workflows (optional test)

---

# 📊 PRODUCTION URLS

After deployment, you'll have:

**Production App**: `https://granthunter2.vercel.app` (or your custom domain)  
**Inngest Dashboard**: `https://app.inngest.com`  
**Vercel Dashboard**: `https://vercel.com/your-username/granthunter2`  
**GitHub Repo**: `https://github.com/your-username/granthunter2`  
**Supabase Dashboard**: `https://supabase.com/dashboard/project/qagyzxxamjwpqsqwqjth`

---

# 🚀 WHAT'S NEXT?

After successful deployment:

1. **Add Users**: Invite team members via Supabase Auth
2. **Set Up Agents**: Configure SAM.gov search agents
3. **Test Workflows**: Generate a test proposal
4. **Monitor**: Watch Inngest dashboard for job execution
5. **Optimize**: Add Redis, Claude as needed
6. **Scale**: Upgrade tiers as usage grows

---

# 💡 PRO TIPS

1. **Environment Variables**: Always use Vercel's environment variables, never hardcode secrets
2. **Previews**: Vercel creates preview URLs for every branch/PR automatically
3. **Rollback**: Can instantly rollback to previous deployment in Vercel
4. **Logs**: Monitor Vercel function logs for errors
5. **Analytics**: Enable Vercel Analytics for traffic insights

---

**Questions?**
- Vercel Docs: https://vercel.com/docs
- Inngest Docs: https://www.inngest.com/docs
- Supabase Docs: https://supabase.com/docs

**Date**: 2025-12-28  
**Status**: 🚀 Ready to Deploy
