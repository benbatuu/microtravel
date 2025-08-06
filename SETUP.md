# SaaS Platform Setup Guide

This guide will help you set up the complete SaaS platform transformation for the microtravel application.

## Prerequisites

- Node.js 18+ installed
- A Supabase project created
- A Stripe account (test mode is fine for development)

## Step 1: Environment Configuration

The environment variables have been configured in `.env`. Verify the following:

### ✅ Completed
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `NEXT_PUBLIC_APP_URL` - Application URL (localhost:3000 for development)
- `JWT_SECRET` - Random secret for JWT operations

## Step 2: Database Schema Setup

### ✅ Migration File Created
A comprehensive database migration has been created at:
`supabase/migrations/000_complete_schema_setup.sql`

### 🔧 Next Steps Required

1. **Apply the Database Migration**:
   - Go to your Supabase dashboard: https://app.supabase.com
   - Navigate to your project
   - Go to the SQL Editor
   - Copy the contents of `supabase/migrations/000_complete_schema_setup.sql`
   - Paste and run the SQL

2. **Verify Database Setup**:
   ```bash
   node scripts/setup-database.js
   ```

## Step 3: Test API Connectivity

After applying the database migration:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test API connectivity**:
   Visit: http://localhost:3000/api/test-connectivity
   
   This should return:
   ```json
   {
     "success": true,
     "environment": { "status": "success" },
     "connections": [
       { "service": "Supabase Client", "status": "success" },
       { "service": "Supabase Admin", "status": "success" },
       { "service": "Stripe", "status": "success" }
     ]
   }
   ```

3. **Test dashboard access**:
   Visit: http://localhost:3000/api/dashboard-test

## Step 4: Verify Dashboard Access

1. Visit: http://localhost:3000/dashboard
2. The dashboard should load without API connectivity errors

## Database Schema Overview

The migration creates the following tables:

### Core Tables
- `profiles` - Extended user profiles with subscription info
- `subscription_tiers` - Available subscription plans
- `subscriptions` - User subscription tracking
- `payment_history` - Payment transaction history
- `usage_tracking` - Feature usage analytics

### Content Tables
- `image_metadata` - Image storage and metadata
- Storage bucket policies for secure file uploads

### Admin Tables
- `admin_sessions` - Admin session management
- `admin_audit_log` - Admin action tracking
- `webhook_events` - Stripe webhook processing
- `system_alerts` - System monitoring alerts
- `support_tickets` - Customer support system

### Features Included
- ✅ Row Level Security (RLS) policies
- ✅ Proper indexes for performance
- ✅ Triggers for automatic updates
- ✅ Storage quota management
- ✅ Default subscription tiers

## Troubleshooting

### Database Connection Issues
If you see "permission denied for schema public":
1. Make sure you've applied the database migration
2. Verify your service role key is correct
3. Check that your Supabase project is active

### API Key Issues
If Stripe tests fail:
1. Verify your Stripe keys are from the same account
2. Make sure you're using test keys for development
3. Check that webhook secret matches your Stripe dashboard

### Environment Variable Issues
Run the setup script to verify:
```bash
node scripts/setup-database.js
```

## Next Steps

After completing this setup:
1. The environment configuration is fixed ✅
2. The database schema is comprehensive ✅
3. API connectivity should work ✅
4. Dashboard access should be restored ✅

You can now proceed with the remaining tasks in the implementation plan:
- Landing page redesign
- Authentication system enhancements
- Subscription flow implementation
- UI/UX improvements

## Support

If you encounter issues:
1. Check the API test endpoints for specific error messages
2. Verify all environment variables are set correctly
3. Ensure the database migration was applied successfully
4. Check Supabase and Stripe dashboard for any service issues