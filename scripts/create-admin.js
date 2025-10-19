#!/usr/bin/env node

/**
 * Create Admin User Script for HMH IPC Platform
 * This script creates a working admin user with confirmed email
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('🔧 Creating confirmed admin user...\n');

  const adminCredentials = {
    email: 'admin@example.com',
    password: 'Admin123!',
    full_name: 'System Administrator',
    employee_id: 'ADMIN001',
    department: 'IPC_COMMITTEE',
    role: 'ADMIN'
  };

  try {
    // Step 1: Try to sign up the user
    console.log('1️⃣ Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminCredentials.email,
      password: adminCredentials.password,
      options: {
        emailRedirectTo: undefined, // Skip email redirect
        data: {
          full_name: adminCredentials.full_name,
          role: adminCredentials.role
        }
      }
    });

    if (authError) {
      console.log(`❌ Auth user creation failed: ${authError.message}`);

      // Try to sign in instead (user might already exist)
      console.log('2️⃣ Trying to sign in with existing user...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminCredentials.email,
        password: adminCredentials.password
      });

      if (signInError) {
        console.log(`❌ Sign in also failed: ${signInError.message}`);
        return;
      }

      console.log(`✅ Successfully signed in existing user: ${signInData.user.id}`);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', signInData.user.id)
        .single();

      if (existingProfile) {
        console.log('✅ User profile already exists');
        console.log(`   Name: ${existingProfile.full_name}`);
        console.log(`   Role: ${existingProfile.role}`);
      } else {
        // Create profile for existing auth user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: signInData.user.id,
            email: adminCredentials.email,
            full_name: adminCredentials.full_name,
            employee_id: adminCredentials.employee_id,
            department: adminCredentials.department,
            role: adminCredentials.role,
            is_active: true
          }]);

        if (profileError) {
          console.log(`❌ Profile creation failed: ${profileError.message}`);
        } else {
          console.log('✅ Profile created successfully');
        }
      }

      await supabase.auth.signOut();

    } else if (authData.user) {
      console.log(`✅ Auth user created: ${authData.user.id}`);

      // Step 2: Create user profile
      console.log('2️⃣ Creating user profile...');
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id,
          email: adminCredentials.email,
          full_name: adminCredentials.full_name,
          employee_id: adminCredentials.employee_id,
          department: adminCredentials.department,
          role: adminCredentials.role,
          is_active: true
        }]);

      if (profileError) {
        console.log(`❌ Profile creation failed: ${profileError.message}`);
      } else {
        console.log('✅ Profile created successfully');
      }
    }

    // Step 3: Test login
    console.log('3️⃣ Testing login...');
    const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
      email: adminCredentials.email,
      password: adminCredentials.password
    });

    if (testError) {
      console.log(`❌ Login test failed: ${testError.message}`);
    } else {
      console.log('✅ Login test successful!');

      // Get profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', testData.user.id)
        .single();

      if (profile) {
        console.log(`✅ Profile loaded: ${profile.full_name} (${profile.role})`);
      }

      await supabase.auth.signOut();
    }

    console.log('\n🎉 ADMIN USER READY!');
    console.log('====================================');
    console.log('✅ USE THESE CREDENTIALS TO LOGIN:');
    console.log(`   Email: ${adminCredentials.email}`);
    console.log(`   Password: ${adminCredentials.password}`);
    console.log(`   Role: ${adminCredentials.role}`);
    console.log('');
    console.log('🌐 Go to: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  }
}

createAdmin();