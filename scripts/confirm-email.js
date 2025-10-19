#!/usr/bin/env node

/**
 * Email Confirmation Helper Script
 * This script helps bypass email confirmation for development
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

async function createConfirmedUser() {
  console.log('🔧 Creating a confirmed user for immediate login...\n');

  // Try creating a user with auto-confirmation
  const userCredentials = {
    email: 'dev.admin@hmh.com',
    password: 'DevAdmin123!',
    full_name: 'Development Administrator',
    employee_id: 'DEV001',
    department: 'IPC_COMMITTEE',
    role: 'ADMIN'
  };

  try {
    console.log('1️⃣ Creating user with auto-confirmation...');

    // Try different email formats that might work
    const emailsToTry = [
      'dev.admin@hmh.com',
      'devadmin@localhost.local',
      'admin@dev.local',
      'test.admin@gmail.com'
    ];

    let successfulUser = null;

    for (const testEmail of emailsToTry) {
      console.log(`   Trying: ${testEmail}`);

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: testEmail,
          password: userCredentials.password,
          options: {
            emailRedirectTo: undefined,
            data: {
              email_confirm: true,
              role: 'admin'
            }
          }
        });

        if (authError) {
          console.log(`   ❌ Failed: ${authError.message}`);
          continue;
        }

        if (authData.user) {
          console.log(`   ✅ User created: ${authData.user.id}`);

          // Create profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{
              user_id: authData.user.id,
              email: testEmail,
              full_name: userCredentials.full_name,
              employee_id: `DEV${Math.floor(Math.random() * 1000)}`,
              department: userCredentials.department,
              role: userCredentials.role,
              is_active: true
            }]);

          if (profileError) {
            console.log(`   ❌ Profile creation failed: ${profileError.message}`);
            continue;
          }

          console.log(`   ✅ Profile created successfully`);

          // Test login immediately
          console.log(`   🧪 Testing login...`);

          const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: userCredentials.password
          });

          if (testError) {
            console.log(`   ❌ Login failed: ${testError.message}`);
            continue;
          } else {
            console.log(`   ✅ Login successful!`);

            successfulUser = {
              email: testEmail,
              password: userCredentials.password,
              user: testData.user
            };

            await supabase.auth.signOut();
            break;
          }
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        continue;
      }
    }

    if (successfulUser) {
      console.log('\n🎉 SUCCESS! Working credentials created:');
      console.log('=====================================');
      console.log(`📧 Email: ${successfulUser.email}`);
      console.log(`🔑 Password: ${successfulUser.password}`);
      console.log(`👤 Role: Administrator`);
      console.log('');
      console.log('🌐 Login URL: http://localhost:3000/login');
      console.log('');
      console.log('✅ This user is confirmed and ready to use!');
    } else {
      console.log('\n❌ Could not create a working user with any email format.');
      console.log('\n📋 ALTERNATIVE SOLUTIONS:');
      console.log('1. Check your Supabase dashboard at: https://supabase.com/dashboard');
      console.log('2. Go to Authentication > Users');
      console.log('3. Find the user and manually confirm their email');
      console.log('4. Or disable email confirmation in Auth settings');
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

async function showSupabaseInstructions() {
  console.log('\n📋 SUPABASE DASHBOARD INSTRUCTIONS:');
  console.log('=====================================');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project: kdqyhyrwbalpeapelzyz');
  console.log('3. Navigate to: Authentication > Users');
  console.log('4. Find users: hmhadmin@gmail.com or hmh.admin@outlook.com');
  console.log('5. Click on the user');
  console.log('6. Click "Confirm Email" button');
  console.log('');
  console.log('OR disable email confirmation:');
  console.log('1. Go to: Authentication > Settings');
  console.log('2. Under "User Signups" disable "Enable email confirmations"');
  console.log('3. Save changes');
  console.log('');
  console.log('Existing credentials to use after confirmation:');
  console.log('📧 hmhadmin@gmail.com / HMHAdmin123!');
  console.log('📧 hmh.admin@outlook.com / HMHAdmin123!');
}

// Run both functions
async function main() {
  await createConfirmedUser();
  await showSupabaseInstructions();
}

main();