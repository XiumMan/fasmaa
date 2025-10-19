# Fix Dashboard Data Display Issue

## Problem
The data exists in the database but the dashboard shows 0 cases because Row Level Security (RLS) policies are blocking SELECT queries.

## Solution
You need to update the RLS policies in Supabase to allow read access.

## Steps to Fix:

### Option 1: Run SQL Script (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the SQL**
   - Open the file: `scripts/fix-rls-policies.sql`
   - Copy all the content
   - Paste it into the SQL Editor

4. **Run the Query**
   - Click "Run" or press `Ctrl+Enter` (Cmd+Enter on Mac)
   - Wait for "Success" message

5. **Refresh Your Dashboard**
   - Go back to http://localhost:3000
   - Refresh the page
   - You should now see all 24 records!

### Option 2: Manual Policy Creation

If you prefer to create policies manually through the Supabase UI:

1. Go to **Database → Policies** in Supabase Dashboard
2. For each table (`cauti_surveillance`, `clabsi_surveillance`, `mdr_surveillance`):
   - Click "New Policy"
   - Choose "Enable read access for all users"
   - For SELECT operations, set: `true`
   - Save

## What This Does

The SQL script:
- ✅ Enables read (SELECT) access for all users (including anonymous)
- ✅ Keeps write (INSERT/UPDATE) restricted to authenticated users
- ✅ Maintains security while allowing dashboard to display data

## Verification

After running the script, check:
```bash
node scripts/check-data.js
```

You should see:
```
CAUTI count: 8
CLABSI count: 7
MDR count: 9
```

## Security Note

This configuration allows **read-only** access to surveillance data for anonymous users, which is appropriate for a dashboard view. Write operations still require authentication.

If you need stricter security (only authenticated users can read), modify the policies to use `auth.role() = 'authenticated'` instead of `true`.
