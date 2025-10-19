#!/usr/bin/env node

/**
 * Fix Admin User - Link existing auth user to profile
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

async function fixAdmin() {
  console.log('🔧 Fixing admin user setup...\n');

  try {
    // Step 1: Update the existing hmhadmin profile
    console.log('1️⃣ Updating profile for hmhadmin@gmail.com...');

    const authUserId = '01fef8eb-4700-43ed-811b-8964b3bd983d'; // From previous attempt

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: authUserId,
        email: 'hmhadmin@gmail.com',
        full_name: 'HMH System Administrator',
        employee_id: 'ADMIN999',
        department: 'IPC_COMMITTEE',
        role: 'ADMIN',
        is_active: true
      }]);

    if (profileError) {
      console.log(`❌ Profile creation failed: ${profileError.message}`);

      // Try updating existing profile
      console.log('2️⃣ Trying to update existing profile...');
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          user_id: authUserId,
          role: 'ADMIN',
          is_active: true
        })
        .eq('email', 'hmhadmin@gmail.com');

      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`);
      } else {
        console.log('✅ Profile updated successfully');
      }
    } else {
      console.log('✅ Profile created successfully');
    }

    // Step 2: Let's also create a simple working user with a different approach
    console.log('3️⃣ Creating a secondary test admin...');

    // Try with a university email format
    const testEmail = 'admin@test.edu';
    const testPassword = 'TestAdmin123!';

    const { data: testAuthData, error: testAuthError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (testAuthError) {
      console.log(`❌ Test user creation failed: ${testAuthError.message}`);
    } else if (testAuthData.user) {
      console.log(`✅ Test user created: ${testAuthData.user.id}`);

      const { error: testProfileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: testAuthData.user.id,
          email: testEmail,
          full_name: 'Test Administrator',
          employee_id: 'TEST001',
          department: 'IPC_COMMITTEE',
          role: 'ADMIN',
          is_active: true
        }]);

      if (testProfileError) {
        console.log(`❌ Test profile creation failed: ${testProfileError.message}`);
      } else {
        console.log('✅ Test profile created successfully');

        console.log('\n🎉 TEST ADMIN CREATED!');
        console.log('=====================================');
        console.log('✅ USE THESE CREDENTIALS:');
        console.log(`📧 Email: ${testEmail}`);
        console.log(`🔑 Password: ${testPassword}`);
        console.log('');
      }
    }

    // Step 3: Try yet another approach with a .com email
    console.log('4️⃣ Creating main admin with .com email...');

    const mainEmail = 'hmh.admin@outlook.com';
    const mainPassword = 'HMHAdmin123!';

    const { data: mainAuthData, error: mainAuthError } = await supabase.auth.signUp({
      email: mainEmail,
      password: mainPassword
    });

    if (mainAuthError) {
      console.log(`❌ Main admin creation failed: ${mainAuthError.message}`);
    } else if (mainAuthData.user) {
      console.log(`✅ Main admin created: ${mainAuthData.user.id}`);

      const { error: mainProfileError } = await supabase.auth.signUp({
        user_id: mainAuthData.user.id,
        email: mainEmail,
        full_name: 'HMH System Administrator',
        employee_id: 'HMH001',
        department: 'IPC_COMMITTEE',
        role: 'ADMIN',
        is_active: true
      });

      if (mainProfileError) {
        console.log(`❌ Main profile creation failed: ${mainProfileError.message}`);
      } else {
        console.log('✅ Main profile created successfully');

        console.log('\n🎉 MAIN ADMIN CREATED!');
        console.log('=====================================');
        console.log('✅ PRIMARY CREDENTIALS:');
        console.log(`📧 Email: ${mainEmail}`);
        console.log(`🔑 Password: ${mainPassword}`);
        console.log('');
      }
    }

    console.log('\n📋 ALL AVAILABLE OPTIONS:');
    console.log('1. hmhadmin@gmail.com / HMHAdmin123! (may need email confirmation)');
    console.log('2. admin@test.edu / TestAdmin123!');
    console.log('3. hmh.admin@outlook.com / HMHAdmin123!');
    console.log('');
    console.log('🌐 Login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixAdmin();