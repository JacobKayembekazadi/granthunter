# Inngest Production Setup - Step by Step

## 🎯 What You'll Get

- ✅ Background job processing (SAM.gov scanning)
- ✅ Long-running workflows (proposal generation)
- ✅ Automatic retries and error handling
- ✅ No timeouts (unlike Vercel's 10s limit)
- ✅ **FREE TIER**: 100,000 events/month!

---

## 📋 Step-by-Step Guide

### Step 1: Sign Up for Inngest (2 minutes)

1. **Go to**: https://www.inngest.com/
2. Click **"Sign Up"** (top right)
3. Choose **"Continue with GitHub"** (easiest) or use email
4. **No credit card required** for free tier!

**Result**: You'll be logged into the Inngest dashboard

---

### Step 2: Create Your First Project (1 minute)

1. After signing in, you'll see **"Create a new app"**
2. **App Name**: `GrantHunter` (or whatever you want)
3. Click **"Create App"**

**Result**: You now have an Inngest app/project

---

### Step 3: Get Your Event Key (30 seconds)

1. In the Inngest dashboard, look for **"Event Keys"** in the left sidebar
2. You'll see a key that looks like: `inngest_event_key_prod_XXXXXXXXXXXX`
3. Click the **"Copy"** button

**Result**: Event key copied to clipboard

---

### Step 4: Get Your Signing Key (30 seconds)

1. Still in the dashboard, click **"Signing Keys"** (or "API Keys")
2. You'll see a key that looks like: `signkey-prod-XXXXXXXXXXXX`
3. Click **"Copy"**

**Result**: Signing key copied to clipboard

---

### Step 5: Add Keys to Your .env.local (1 minute)

Open `c:\Users\jacob\Downloads\govconAI\granthunter2\.env.local` and update:

```env
# Replace these placeholder keys:
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here

# With your real keys:
INNGEST_EVENT_KEY=inngest_event_key_prod_XXXXXXXXXXXX
INNGEST_SIGNING_KEY=signkey-prod-XXXXXXXXXXXX
```

**Save the file!**

---

### Step 6: Restart Your Dev Servers (1 minute)

Stop and restart both servers to load the new keys:

**Terminal 1** (stop with Ctrl+C, then restart):
```bash
npm run dev
```

**Terminal 2** (stop with Ctrl+C, then restart):
```bash
npx inngest-cli@latest dev
```

**Result**: Servers now using production Inngest keys

---

### Step 7: Verify Connection (2 minutes)

#### Option A: Via Inngest Dashboard
1. Go back to https://app.inngest.com
2. Click **"Functions"** in the sidebar
3. You should see your functions listed:
   - `scan-opportunities`
   - `generate-proposal`
   - `embed-documents`

#### Option B: Via Inngest Dev Server
1. Open http://localhost:8288
2. You should see your functions synced

**If you see your functions** → ✅ **SUCCESS!**

---

## 🧪 Test a Function (Optional)

### Test the Scout Agent (Opportunity Scanning)

1. **Via Inngest Dashboard**:
   - Go to https://app.inngest.com
   - Click **"Functions"** → **"scan-opportunities"**
   - Click **"Test"** or **"Trigger"**
   
2. **Via Your App**:
   - Go to http://localhost:3000/hunter
   - Create a new search agent
   - It will trigger the workflow automatically

---

## 📊 What Each Key Does

| Key | Purpose | Where It's Used |
|-----|---------|-----------------|
| **Event Key** | Sends events to Inngest | When your app triggers workflows |
| **Signing Key** | Authenticates Inngest → Your App | When Inngest calls your API routes |

---

## 🚨 Troubleshooting

### "Functions not showing up"
**Solution**: Make sure both keys are set correctly and servers are restarted.

### "Invalid signing key"
**Solution**: Double-check you copied the **signing key** (starts with `signkey-`) not the event key.

### "Rate limit exceeded"
**Solution**: Free tier = 100K events/month. For more, upgrade to paid tier ($20/month).

---

## 🎯 Next Steps After Setup

### 1. Test Background Jobs
```bash
# Trigger from command line (for testing)
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "app/opportunities.scan", "data": {}}'
```

### 2. Check Workflow Logs
- Go to https://app.inngest.com
- Click **"Runs"** to see all executions
- Click any run to see detailed logs

### 3. Set Up Scheduled Jobs (Optional)
In your Inngest dashboard, you can schedule functions to run automatically:
- Every day at 6am: Scan SAM.gov for new opportunities
- Every hour: Check for proposal deadlines
- Every week: Generate performance reports

---

## 💰 Pricing (as of Dec 2024)

| Tier | Price | Events/Month | Features |
|------|-------|-------------|----------|
| **Free** | $0 | 100,000 | Perfect for development & testing |
| **Pro** | $20 | 500,000 | Production use, better support |
| **Team** | $99 | 2,500,000 | Team collaboration, priority support |

**For GrantHunter**: Free tier is plenty to start! You can process ~3,000 proposals/month.

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** to Git (already in `.gitignore`)
2. **Use environment variables** in production (Vercel/deployment platform)
3. **Rotate keys** if ever exposed
4. **Separate dev/prod keys** (optional but recommended)

---

## 📝 Quick Reference

**Inngest Dashboard**: https://app.inngest.com  
**Inngest Docs**: https://www.inngest.com/docs  
**Local Dev UI**: http://localhost:8288  

**Your Functions**:
- `app/opportunities.scan` - SAM.gov opportunity scanning
- `app/proposal.generate` - Proposal generation workflow
- `app/documents.embed` - RAG document processing

---

## ✅ Success Checklist

After completing this guide, you should have:

- [ ] Inngest account created
- [ ] Event key copied
- [ ] Signing key copied
- [ ] Keys added to `.env.local`
- [ ] Servers restarted
- [ ] Functions visible in Inngest dashboard
- [ ] (Optional) Test function executed

**Time Required**: ~10 minutes total

---

## 🎉 You're Done!

Your GrantHunter system now has:
- ✅ Background job processing
- ✅ Workflow orchestration
- ✅ Automatic retries
- ✅ Production-ready infrastructure

**Next**: Consider adding Redis (Upstash) for caching, or deploy to production!

---

**Need Help?**
- Inngest Docs: https://www.inngest.com/docs
- Inngest Discord: https://www.inngest.com/discord
- Or ask me! 😊

**Date**: 2025-12-28  
**Status**: 🚀 Ready to Set Up
