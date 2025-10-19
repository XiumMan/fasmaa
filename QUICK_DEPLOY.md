# 🚀 Quick Deploy to Vercel - 5 Minutes

## ✅ Step 1: Go to Vercel (1 min)
1. Visit: **https://vercel.com**
2. Click **"Log in"** with GitHub
3. Click **"Add New..."** → **"Project"**

## ✅ Step 2: Import Repository (30 sec)
1. Find **"XiumMan/fasmaa"** in the list
2. Click **"Import"**
3. Click **"Deploy"** (don't configure anything yet)

## ✅ Step 3: Wait for First Build (2 min)
- Building...
- ✅ Deployment complete!
- You'll get a URL like: `https://fasmaa-xxxxx.vercel.app`

## ⚠️ Step 4: Add Environment Variables (1 min)
**IMPORTANT**: Without these, the app won't work!

1. Click **"Settings"** (top menu)
2. Click **"Environment Variables"** (left sidebar)
3. Add these 3 variables:

### Variable 1:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: (copy from your .env.local file)
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 2:
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: (copy from your .env.local file)
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 3:
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: (copy from your .env.local file)
Environments: ✅ Production ✅ Preview ✅ Development
```

## ✅ Step 5: Redeploy (30 sec)
1. Click **"Deployments"** (top menu)
2. Click the **⋮** menu on the latest deployment
3. Click **"Redeploy"**
4. Click **"Redeploy"** again to confirm

## 🎉 Done! (30 sec)
- Wait for redeployment to complete
- Click **"Visit"** to see your live site!
- Test: `https://your-url.vercel.app/launch` for the launch sequence

---

## 📋 Your Environment Variables

Copy these from your `.env.local` file:

```bash
# Find these values in your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=https://kdqyhyrwbalpea...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsI...
```

---

## ✅ Final Checklist

- [ ] Deployed to Vercel
- [ ] All 3 environment variables added
- [ ] Redeployed after adding variables
- [ ] Dashboard shows data (24 records)
- [ ] Launch sequence works (`/launch`)
- [ ] Login works
- [ ] Shared URL with team

---

## 🆘 Issues?

**Dashboard shows 0 cases?**
→ Check environment variables are added and you redeployed

**Can't login?**
→ Check Supabase environment variables are correct

**Audio not playing?**
→ Try on different browser, some browsers block autoplay

**Build failed?**
→ Check build logs in Vercel, usually missing dependencies

---

**Full guide**: See `DEPLOYMENT_GUIDE.md` for detailed instructions
