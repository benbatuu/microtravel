#!/usr/bin/env node

/**
 * Database Setup Script
 * This script helps set up the Supabase database with the complete schema
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Database Setup Script');
console.log('========================');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please create one first.');
    process.exit(1);
}

// Read environment variables from .env file manually
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

// Set environment variables
Object.keys(envVars).forEach(key => {
    if (!process.env[key]) {
        process.env[key] = envVars[key];
    }
});

const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('📋 Checking environment variables...');
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('\n📝 Please update your .env file with the following:');
    console.log('   - Get your Supabase URL and keys from: https://app.supabase.com/project/[your-project]/settings/api');
    console.log('   - Make sure to use the service_role key (not anon key) for SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Check for placeholder values
const placeholderChecks = [
    { key: 'SUPABASE_SERVICE_ROLE_KEY', placeholder: 'your_service_role_key_here' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', placeholder: 'placeholder_service_role_key' }
];

const hasPlaceholders = placeholderChecks.some(({ key, placeholder }) =>
    process.env[key] === placeholder || process.env[key]?.includes('placeholder')
);

if (hasPlaceholders) {
    console.error('❌ Placeholder values detected in environment variables');
    console.log('\n📝 Please update your .env file with actual values from Supabase dashboard');
    console.log('   - Go to: https://app.supabase.com/project/[your-project]/settings/api');
    console.log('   - Copy the service_role key (not the anon key)');
    console.log('   - Replace the placeholder value in SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

console.log('✅ Environment variables look good');

// Read the migration file
const migrationPath = path.join(process.cwd(), 'supabase/migrations/000_complete_schema_setup.sql');
if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found at:', migrationPath);
    process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
console.log('📄 Migration file loaded');

console.log('\n🔧 Next Steps:');
console.log('1. Make sure your Supabase project is running');
console.log('2. Go to your Supabase dashboard SQL editor');
console.log('3. Copy and paste the migration SQL from: supabase/migrations/000_complete_schema_setup.sql');
console.log('4. Run the SQL to create all tables and policies');
console.log('5. Test the connection by running: npm run dev');
console.log('6. Visit: http://localhost:3000/api/test-connectivity');

console.log('\n📋 Migration Summary:');
console.log('   - Creates profiles, subscriptions, payment_history tables');
console.log('   - Sets up image_metadata and storage policies');
console.log('   - Creates admin and monitoring tables');
console.log('   - Adds proper indexes and RLS policies');
console.log('   - Inserts default subscription tiers');

console.log('\n✨ Setup script completed!');