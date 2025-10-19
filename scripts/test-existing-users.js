#!/usr/bin/env node

/**
 * Test existing users with actual credentials
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

async function testExistingUsers() {
  console.log('🔍 Testing existing users with known credentials...\n');

  // Users with user_id from previous test
  const usersToTest = [
    { email: 'ipc.focal@hmh.mv', password: 'password123', role: 'IPC_FOCAL' },
    { email: 'ibrahim.waheed@hmh.mv', password: 'password123', role: 'ADMIN' },
    { email: 'muiz.ibrahim@hmh.mv', password: 'password123', role: 'MEDICAL_OFFICER' }
  ];

  for (const testUser of usersToTest) {
    console.log(`🧪 Testing: ${testUser.email} (${testUser.role})`);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });

      if (authError) {
        console.log(`   ❌ Login failed: ${authError.message}`);
      } else if (authData.user) {
        console.log(`   ✅ Login successful!`);
        console.log(`   👤 User ID: ${authData.user.id}`);

        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (profileError || !profile) {
          console.log(`   ❌ Profile not found: ${profileError?.message || 'No profile'}`);
        } else {
          console.log(`   ✅ Profile found: ${profile.full_name} (${profile.role})`);
          console.log(`   ✅ WORKING CREDENTIALS FOUND!`);
          console.log(`   📧 Email: ${testUser.email}`);
          console.log(`   🔑 Password: ${testUser.password}`);

          await supabase.auth.signOut();

          console.log('\n🎉 SUCCESS! Use these credentials:');
          console.log(`Email: ${testUser.email}`);
          console.log(`Password: ${testUser.password}`);
          console.log(`Role: ${profile.role}`);
          console.log(`Name: ${profile.full_name}`);
          return; // Exit on first success
        }

        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('');
  }

  // If no users work, let's try creating a simple one
  console.log('🔧 Creating a simple test user...');

  const simpleUser = {
    email: 'test@test.com',
    password: 'test123',
    full_name: 'Test User',
    role: 'ADMIN',
    department: 'IPC_COMMITTEE'
  };

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: simpleUser.email,
      password: simpleUser.password
    });

    if (authError) {
      console.log(`❌ Simple user creation failed: ${authError.message}`);
    } else if (authData.user) {
      console.log(`✅ Simple user created: ${authData.user.id}`);

      // Create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id,
          email: simpleUser.email,
          full_name: simpleUser.full_name,
          department: simpleUser.department,
          role: simpleUser.role,
          is_active: true
        }]);

      if (profileError) {
        console.log(`❌ Profile creation failed: ${profileError.message}`);
      } else {
        console.log('✅ Profile created successfully');
        console.log('\n🎉 NEW USER CREATED! Use these credentials:');
        console.log(`Email: ${simpleUser.email}`);
        console.log(`Password: ${simpleUser.password}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error creating simple user: ${error.message}`);
  }

  console.log('\n🌐 Try logging in at: http://localhost:3000/login');
}

testExistingUsers();