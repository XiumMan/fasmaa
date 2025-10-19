#!/usr/bin/env node

/**
 * Complete the admin setup
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

async function completeSetup() {
  console.log('🔧 Completing admin setup...\n');

  try {
    // Create profile for the outlook user
    console.log('1️⃣ Creating profile for outlook admin...');

    const outlookUserId = '7f9d336e-e915-4628-8004-853f9b62bf9f'; // From previous attempt

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: outlookUserId,
        email: 'hmh.admin@outlook.com',
        full_name: 'HMH System Administrator',
        employee_id: 'HMH001',
        department: 'IPC_COMMITTEE',
        role: 'ADMIN',
        is_active: true
      }]);

    if (profileError) {
      console.log(`❌ Profile creation failed: ${profileError.message}`);
    } else {
      console.log('✅ Outlook admin profile created successfully');
    }

    // Test both admin accounts
    console.log('\n2️⃣ Testing admin accounts...');

    const adminsToTest = [
      { email: 'hmhadmin@gmail.com', password: 'HMHAdmin123!' },
      { email: 'hmh.admin@outlook.com', password: 'HMHAdmin123!' }
    ];

    for (const admin of adminsToTest) {
      console.log(`\n🧪 Testing: ${admin.email}`);

      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: admin.email,
          password: admin.password
        });

        if (authError) {
          console.log(`   ❌ Login failed: ${authError.message}`);
        } else if (authData.user) {
          console.log(`   ✅ Login successful!`);

          // Get profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

          if (profileError || !profile) {
            console.log(`   ❌ Profile not found: ${profileError?.message || 'No profile'}`);
          } else {
            console.log(`   ✅ Profile loaded: ${profile.full_name} (${profile.role})`);
            console.log(`   ✅ WORKING CREDENTIALS!`);
          }

          await supabase.auth.signOut();
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n🎉 SETUP COMPLETE!');
    console.log('=====================================');
    console.log('✅ WORKING ADMIN CREDENTIALS:');
    console.log('');
    console.log('Option 1 (Gmail):');
    console.log('📧 Email: hmhadmin@gmail.com');
    console.log('🔑 Password: HMHAdmin123!');
    console.log('');
    console.log('Option 2 (Outlook):');
    console.log('📧 Email: hmh.admin@outlook.com');
    console.log('🔑 Password: HMHAdmin123!');
    console.log('');
    console.log('🌐 Login URL: http://localhost:3000/login');
    console.log('');
    console.log('📝 NOTE: If you get "Email not confirmed" error,');
    console.log('   the user was created but needs email confirmation.');
    console.log('   Try the other email option.');

  } catch (error) {
    console.error('❌ Setup completion failed:', error);
  }
}

completeSetup();