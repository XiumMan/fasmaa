# 🚀 Deploy HMH IPC Platform to Vercel

This guide will help you deploy your application to Vercel for the software launch demo.

---

## 📋 Prerequisites

- [x] Git repository committed and pushed
- [x] Supabase project is set up and running
- [x] Database populated with dummy data (24 records)
- [x] RLS policies configured for data access

---

## 🔧 Step 1: Prepare Your Repository

### Push to GitHub (if not already done)

```bash
# Check remote
git remote -v

# If no remote exists, add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Sign Up" or "Log In" (use GitHub account)

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your `hmh-ipc-platform` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - Click "Deploy" (we'll add environment variables after first deploy)

4. **Wait for Deployment**
   - First deployment will take 2-3 minutes
   - You'll see a build log in real-time

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hmh-ipc-platform
# - Directory? ./
# - Override settings? No
```

---

## 🔐 Step 3: Configure Environment Variables

After the initial deployment:

1. **Go to Project Settings**
   - In Vercel dashboard, click on your project
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

2. **Add Environment Variables**

   Add these variables one by one:

   | Name | Value | Source |
   |------|-------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | From `.env.local` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | From `.env.local` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | From `.env.local` |

   **How to Add Each Variable:**
   - Click "Add New"
   - Enter the variable name
   - Paste the value from your `.env.local` file
   - Select "Production", "Preview", and "Development" environments
   - Click "Save"

3. **Redeploy with Environment Variables**
   - Go to "Deployments" tab
   - Click the three dots ⋮ on the latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

---

## ✅ Step 4: Verify Deployment

1. **Visit Your Live Site**
   - Vercel will provide a URL like: `https://hmh-ipc-platform.vercel.app`
   - Or your custom domain if configured

2. **Test Key Features**
   - [ ] Launch sequence plays correctly (`/launch`)
   - [ ] Dashboard shows 24 records (8 CAUTI, 7 CLABSI, 9 MDR)
   - [ ] Graphs display monthly trends
   - [ ] Login works correctly
   - [ ] Forms submission works
   - [ ] Navigation works smoothly

3. **Check for Issues**
   - Open browser console (F12) and check for errors
   - Test on different devices (mobile, tablet, desktop)
   - Test on different browsers (Chrome, Firefox, Safari)

---

## 🎨 Step 5: Optional - Custom Domain

### Add Custom Domain (e.g., fasmaa.hmh.mv)

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" → "Domains"
   - Click "Add Domain"
   - Enter your domain: `fasmaa.hmh.mv`

2. **Configure DNS**
   - Add CNAME record in your DNS provider:
     ```
     Type: CNAME
     Name: fasmaa (or @)
     Value: cname.vercel-dns.com
     ```
   - Wait for DNS propagation (5-30 minutes)

3. **Enable HTTPS**
   - Vercel automatically provisions SSL certificate
   - Your site will be available at `https://fasmaa.hmh.mv`

---

## 🔍 Troubleshooting

### Build Fails

**Error**: "Module not found"
- **Solution**: Check `package.json` has all dependencies
- Run `npm install` locally and commit `package-lock.json`

**Error**: "ESLint errors"
- **Solution**: Already configured to ignore ESLint during builds
- Check `next.config.ts` has `eslint.ignoreDuringBuilds: true`

### Dashboard Shows No Data

**Error**: Stats show 0 cases
- **Solution**: Check RLS policies in Supabase
- Run the SQL from `scripts/fix-rls-policies.sql`
- Verify with: `node scripts/check-data.js` (should show counts)

### Audio/Video Not Loading

**Error**: Launch sequence media not playing
- **Solution**: Check browser console for CORS errors
- Ensure files are in `public/` directory
- Files in `public/` are automatically served by Vercel

### Environment Variables Not Working

**Error**: "Supabase URL is undefined"
- **Solution**:
  1. Check variables are added in Vercel dashboard
  2. Redeploy after adding variables
  3. Variables must start with `NEXT_PUBLIC_` to be accessible in browser

---

## 📊 Performance Optimization

### Recommended Settings (Already Configured)

- ✅ ESLint ignored during builds
- ✅ Scripts excluded from deployment (`.vercelignore`)
- ✅ Images optimized by Next.js Image component
- ✅ Static assets cached automatically

### Optional Optimizations

1. **Enable Analytics**
   - In Vercel project settings
   - Enable "Web Analytics" (free)
   - Monitor performance and user behavior

2. **Enable Speed Insights**
   - In Vercel project settings
   - Enable "Speed Insights" (free)
   - Get Core Web Vitals data

---

## 🎯 Launch Checklist

Before the official demo:

- [ ] Code committed and pushed to GitHub
- [ ] Deployed to Vercel successfully
- [ ] Environment variables configured
- [ ] Dashboard shows all 24 dummy records
- [ ] Launch sequence (`/launch`) works perfectly
- [ ] Audio plays correctly on all browsers
- [ ] Mobile responsive design tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (HTTPS)
- [ ] All forms tested and working
- [ ] Analytics enabled (optional)

---

## 🆘 Support

If you encounter issues:

1. **Check Vercel Logs**
   - Go to Deployments → Click deployment → "Functions" tab
   - Check runtime logs for errors

2. **Check Build Logs**
   - Go to Deployments → Click deployment → "Building" section
   - Review build output for errors

3. **Vercel Documentation**
   - https://vercel.com/docs
   - https://vercel.com/docs/frameworks/nextjs

---

## 🎉 Success!

Your application is now live and ready for the software launch demo!

**Your deployment URL**: `https://your-project.vercel.app`

Share this URL with stakeholders for the demo presentation.

---

## 📝 Quick Deploy Command Reference

```bash
# Deploy from command line
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Open deployment in browser
vercel open
```

Good luck with your launch! 🚀
