#!/usr/bin/env node

/**
 * Create Working Admin User Script
 * Uses a standard email format that should work with Supabase
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

async function createWorkingAdmin() {
  console.log('🔧 Creating working admin user with standard email format...\n');

  const adminCredentials = {
    email: 'hmhadmin@gmail.com',
    password: 'HMHAdmin123!',
    full_name: 'HMH System Administrator',
    employee_id: 'ADMIN999',
    department: 'IPC_COMMITTEE',
    role: 'ADMIN'
  };

  try {
    console.log('1️⃣ Attempting to create admin user...');
    console.log(`   Email: ${adminCredentials.email}`);

    // Try to sign up with email confirmation disabled
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminCredentials.email,
      password: adminCredentials.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          confirm: true, // Try to auto-confirm
        }
      }
    });

    if (authError) {
      console.log(`❌ Signup failed: ${authError.message}`);

      // Maybe user already exists, try signing in
      console.log('2️⃣ Trying to sign in (user might already exist)...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminCredentials.email,
        password: adminCredentials.password
      });

      if (signInError) {
        console.log(`❌ Sign in failed: ${signInError.message}`);

        // Try with a different email
        console.log('3️⃣ Trying with different email format...');
        const altEmail = 'admin@hmh-hospital.com';

        const { data: altAuthData, error: altAuthError } = await supabase.auth.signUp({
          email: altEmail,
          password: adminCredentials.password
        });

        if (altAuthError) {
          console.log(`❌ Alternative email also failed: ${altAuthError.message}`);
          return;
        } else {
          console.log(`✅ Alternative email worked: ${altEmail}`);
          adminCredentials.email = altEmail;
          authData.user = altAuthData.user;
        }
      } else {
        console.log(`✅ Signed in existing user`);
        authData.user = signInData.user;
      }
    }

    if (authData && authData.user) {
      console.log(`✅ Auth user ready: ${authData.user.id}`);
      console.log(`   Email confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);

      // Create or update profile
      console.log('4️⃣ Creating/updating user profile...');

      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (existingProfile) {
        console.log('✅ Profile already exists, updating...');
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            full_name: adminCredentials.full_name,
            role: adminCredentials.role,
            department: adminCredentials.department,
            is_active: true
          })
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.log(`❌ Profile update failed: ${updateError.message}`);
        } else {
          console.log('✅ Profile updated successfully');
        }
      } else {
        console.log('✅ Creating new profile...');
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
          return;
        } else {
          console.log('✅ Profile created successfully');
        }
      }

      // Test the complete login flow
      console.log('5️⃣ Testing complete login flow...');
      await supabase.auth.signOut(); // Sign out first

      const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
        email: adminCredentials.email,
        password: adminCredentials.password
      });

      if (testError) {
        console.log(`❌ Login test failed: ${testError.message}`);
      } else {
        console.log('✅ Login test successful!');

        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', testData.user.id)
          .eq('is_active', true)
          .single();

        if (profileError || !profile) {
          console.log(`❌ Profile fetch failed: ${profileError?.message || 'No profile'}`);
        } else {
          console.log(`✅ Complete login flow successful!`);
          console.log(`   User: ${profile.full_name}`);
          console.log(`   Role: ${profile.role}`);
          console.log(`   Department: ${profile.department}`);
        }

        await supabase.auth.signOut();
      }

      console.log('\n🎉 ADMIN USER IS READY!');
      console.log('=====================================');
      console.log('✅ USE THESE CREDENTIALS TO LOGIN:');
      console.log(`📧 Email: ${adminCredentials.email}`);
      console.log(`🔑 Password: ${adminCredentials.password}`);
      console.log(`👤 Role: Administrator`);
      console.log('');
      console.log('🌐 Login URL: http://localhost:3000/login');
      console.log('');
      console.log('📝 SAVE THESE CREDENTIALS - You will need them to access the system!');

    } else {
      console.log('❌ Failed to create or access user account');
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

createWorkingAdmin();