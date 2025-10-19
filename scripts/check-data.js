const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log('🔍 Checking database with ANON key (simulating dashboard)...\n');
  
  const { count: cautiCount, error: cautiError } = await supabase.from('cauti_surveillance').select('*', { count: 'exact', head: true });
  console.log('CAUTI count:', cautiCount);
  if (cautiError) console.log('CAUTI error:', cautiError.message);
  
  const { count: clabsiCount, error: clabsiError } = await supabase.from('clabsi_surveillance').select('*', { count: 'exact', head: true });
  console.log('CLABSI count:', clabsiCount);
  if (clabsiError) console.log('CLABSI error:', clabsiError.message);
  
  const { count: mdrCount, error: mdrError } = await supabase.from('mdr_surveillance').select('*', { count: 'exact', head: true });
  console.log('MDR count:', mdrCount);
  if (mdrError) console.log('MDR error:', mdrError.message);
  
  console.log('\n🔍 Trying to fetch actual records...\n');
  
  const { data: cautiRecords, error: cautiRecordsError } = await supabase.from('cauti_surveillance').select('id, patient_name, surveillance_date').limit(3);
  console.log('CAUTI records:', cautiRecords?.length || 0, 'found');
  if (cautiRecordsError) console.log('CAUTI records error:', cautiRecordsError.message);
  
  const { data: clabsiRecords, error: clabsiRecordsError } = await supabase.from('clabsi_surveillance').select('id, patient_name, surveillance_date').limit(3);
  console.log('CLABSI records:', clabsiRecords?.length || 0, 'found');
  if (clabsiRecordsError) console.log('CLABSI records error:', clabsiRecordsError.message);
  
  const { data: mdrRecords, error: mdrRecordsError } = await supabase.from('mdr_surveillance').select('id, full_name, report_submission_date').limit(3);
  console.log('MDR records:', mdrRecords?.length || 0, 'found');
  if (mdrRecordsError) console.log('MDR records error:', mdrRecordsError.message);
}

checkData();
