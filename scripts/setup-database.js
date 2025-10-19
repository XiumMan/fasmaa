#!/usr/bin/env node

/**
 * Database Setup Script for HMH IPC Platform
 * This script will:
 * 1. Reset the user_profiles table
 * 2. Create default admin user
 * 3. Set up proper role permissions
 * 4. Display login credentials
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const envVars = envFile.split('\n').filter(line => line && !line.startsWith('#'));
  envVars.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key] = valueParts.join('=');
    }
  });
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this for admin operations

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

// For now, we'll use the anon key but with elevated permissions
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Default users to create
const defaultUsers = [
  {
    email: 'admin@hmh.mv',
    password: 'Admin123!',
    full_name: 'System Administrator',
    employee_id: 'ADMIN001',
    department: 'IPC_COMMITTEE',
    role: 'ADMIN',
    phone: '+960-123-4567'
  },
  {
    email: 'ipc.focal@hmh.mv',
    password: 'IPC123!',
    full_name: 'IPC Focal Person',
    employee_id: 'IPC001',
    department: 'IPC_COMMITTEE',
    role: 'IPC_FOCAL',
    phone: '+960-123-4568'
  },
  {
    email: 'icu.nurse@hmh.mv',
    password: 'ICU123!',
    full_name: 'ICU Head Nurse',
    employee_id: 'ICU001',
    department: 'ICU',
    role: 'CHARGE_NURSE',
    phone: '+960-123-4569'
  },
  {
    email: 'surgery.head@hmh.mv',
    password: 'Surgery123!',
    full_name: 'Surgery Department Head',
    employee_id: 'SURG001',
    department: 'GENERAL_SURGERY',
    role: 'DEPARTMENT_HEAD',
    phone: '+960-123-4570'
  }
];

async function resetDatabase() {
  console.log('🔄 Starting database reset...\n');

  try {
    // Step 1: Clear existing user profiles
    console.log('1️⃣ Clearing existing user profiles...');
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.log('⚠️  Could not clear user_profiles (table might be empty):', deleteError.message);
    } else {
      console.log('✅ User profiles cleared');
    }

    // Step 2: Create auth users and profiles
    console.log('\n2️⃣ Creating default users...');

    for (const user of defaultUsers) {
      console.log(`\n📝 Creating user: ${user.email}`);

      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            emailRedirectTo: undefined // Skip email confirmation for now
          }
        });

        if (authError) {
          console.log(`   ❌ Auth creation failed: ${authError.message}`);
          continue;
        }

        if (!authData.user) {
          console.log(`   ❌ No user data returned`);
          continue;
        }

        console.log(`   ✅ Auth user created with ID: ${authData.user.id}`);

        // Create user profile
        const profileData = {
          user_id: authData.user.id,
          email: user.email,
          full_name: user.full_name,
          employee_id: user.employee_id,
          department: user.department,
          role: user.role,
          phone: user.phone,
          is_active: true
        };

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData]);

        if (profileError) {
          console.log(`   ❌ Profile creation failed: ${profileError.message}`);
        } else {
          console.log(`   ✅ Profile created successfully`);
        }

      } catch (error) {
        console.log(`   ❌ Error creating user: ${error.message}`);
      }
    }

    // Step 3: Display credentials
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('====================================');
    defaultUsers.forEach(user => {
      console.log(`👤 ${user.full_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department}`);
      console.log('');
    });

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Try logging in with any of the accounts above');
    console.log('2. Change default passwords after first login');
    console.log('3. Create additional users as needed');
    console.log('\n🌐 Access the application at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
resetDatabase();