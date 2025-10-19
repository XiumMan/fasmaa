# Populate Dummy Data for Dashboard

The dashboard currently shows empty graphs because there's no data. Here are two ways to populate it:

## Option 1: Use the Forms in the App (Recommended)

1. Visit http://localhost:3000
2. Navigate to "Forms" section
3. Fill out and submit:
   - 5-8 CAUTI Surveillance forms
   - 5-7 CLABSI Surveillance forms
   - 5-9 MDR Surveillance forms

This will populate the database with real data through the normal app workflow.

## Option 2: Use the Populate Script (Requires Service Role Key)

### Step 1: Get your Supabase Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the `service_role` key (NOT the anon key)

### Step 2: Add it to your .env.local file

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Run the population script

```bash
node scripts/populate-dummy-data.js
```

This will create:
- 8 CAUTI cases
- 7 CLABSI cases
- 9 MDR cases

All with randomized data from the past 6 months, which will populate your dashboard graphs and analytics.

## What You'll See After Populating Data

- ✅ Stats cards showing case counts
- ✅ Monthly infection trends graph with 6 months of data
- ✅ Recent submissions list
- ✅ Analytics page with detailed breakdowns
- ✅ Working filters and search

## Troubleshooting

**Error: "new row violates row-level security policy"**
- You need to add the SUPABASE_SERVICE_ROLE_KEY to your .env.local file
- OR use Option 1 (manual form submission through the app)

**Error: "Signups not allowed"**
- This is normal - just use the existing login that works
- The dummy data script will work without authentication once you add the service role key

