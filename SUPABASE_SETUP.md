# Supabase Setup Guide

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create a new project (free tier)

## Step 2: Create Database Table
1. In Supabase dashboard, go to "Table Editor"
2. Click "New Table"
3. Name: `tokens`
4. Enable Row Level Security: OFF (for now)
5. Add these columns:

| Column Name | Type | Default |
|-------------|------|---------|
| id | uuid | auto-generated |
| mint_address | text | - |
| name | text | - |
| symbol | text | - |
| leverage | int8 | - |
| direction | text | - |
| underlying | text | - |
| creator | text | - |
| created_at | timestamptz | now() |

6. Click "Save"

## Step 3: Get API Keys
1. Go to Project Settings → API
2. Copy:
   - `URL` (e.g., https://your-project.supabase.co)
   - `anon public` API key

## Step 4: Add to Vercel Environment Variables
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
```

4. Redeploy

## Done!
Tokens will now persist across deployments.
