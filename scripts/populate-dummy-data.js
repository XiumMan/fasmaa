#!/usr/bin/env node

/**
 * Populate Dummy Data Script for HMH IPC Platform
 * This script will add sample infection data for:
 * - CAUTI cases
 * - CLABSI cases
 * - SSI cases
 * - MDR cases
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

// Supabase configuration - use service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found, using ANON key (may hit RLS policies)');
} else {
  console.log('✅ Using SERVICE_ROLE_KEY (RLS policies will be bypassed)');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get or create a demo user for submissions
async function getDemoUser() {
  // Try to sign in as demo admin
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@hmh.mv',
    password: 'Admin123!'
  });

  if (error || !data.user) {
    throw new Error('Authentication failed');
  }

  console.log(`✅ Authenticated as: ${data.user.email}`);
  return data.user.id;
}

// Helper function to generate random dates in the last 6 months
function randomDate(monthsAgo = 6) {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - monthsAgo);
  const timestamp = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(timestamp).toISOString();
}

// Helper function to get random item from array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Sample data pools
const patientNames = [
  'Ahmed Hassan', 'Fatima Ali', 'Mohamed Ibrahim', 'Aisha Ahmed',
  'Hassan Mohamed', 'Mariyam Hussain', 'Ali Rasheed', 'Aminath Shafeeg',
  'Ibrahim Khaleel', 'Zainab Moosa', 'Hussain Riza', 'Fathimath Nizar'
];

const wards = [
  'ICU', 'General Ward', 'Surgical Ward', 'Pediatric Ward',
  'Gynecology Ward', 'Emergency Department', 'HDU'
];

const bedNumbers = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3'];

const reviewStatuses = ['pending', 'approved', 'requires_revision'];

const antibiotics = [
  'Ceftriaxone', 'Ciprofloxacin', 'Meropenem', 'Vancomycin',
  'Piperacillin-Tazobactam', 'Gentamicin', 'Amoxicillin', 'Azithromycin'
];

const organisms = [
  'E. coli', 'Klebsiella pneumoniae', 'Pseudomonas aeruginosa',
  'Staphylococcus aureus', 'Enterococcus faecalis', 'Acinetobacter baumannii',
  'MRSA', 'VRE', 'ESBL-producing E. coli'
];

const surgeryTypes = [
  'Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'Cesarean Section',
  'Hysterectomy', 'Knee Replacement', 'Hip Replacement', 'Colon Resection'
];

// Generate CAUTI dummy data
async function generateCautiData() {
  console.log('\n📊 Generating CAUTI cases...');
  const cautiCases = [];

  for (let i = 0; i < 8; i++) {
    const surveillanceDate = randomDate(6);
    const caseData = {
      patient_name: randomItem(patientNames),
      hospital_id: 'HMH001',
      age: 25 + Math.floor(Math.random() * 60),
      gender: randomItem(['Male', 'Female']),
      ward_bed_number: `${randomItem(wards)} - Bed ${randomItem(bedNumbers)}`,
      department: randomItem(['ICU', 'GENERAL_SURGERY', 'INTERNAL_MEDICINE', 'PEDIATRICS']),
      catheter_insertion_date: randomDate(7),
      catheter_removal_date: Math.random() > 0.5 ? randomDate(5) : null,
      reason_for_catheter: randomItem(['Urinary retention', 'Postoperative monitoring', 'Critical illness monitoring', 'Urinary incontinence']),
      catheter_type: randomItem(['Foley', 'Suprapubic', 'Intermittent']),
      surveillance_date: surveillanceDate,
      event_date: surveillanceDate,
      symptoms: {
        fever: Math.random() > 0.5,
        suprapubic_tenderness: Math.random() > 0.5,
        costovertebral_angle_tenderness: Math.random() > 0.5,
        urinary_urgency: Math.random() > 0.6,
        dysuria: Math.random() > 0.4,
        frequency: Math.random() > 0.5
      },
      laboratory_findings: {
        positive_urine_culture: Math.random() > 0.3,
        pyuria: Math.random() > 0.5,
        white_blood_cells: Math.random() > 0.5,
        nitrites_positive: Math.random() > 0.6
      },
      meets_cauti_criteria: Math.random() > 0.3,
      infection_preventable: Math.random() > 0.5,
      contributing_factors: randomItem(['Prolonged catheterization', 'Inadequate hand hygiene', 'Improper insertion technique', null]),
      notes: randomItem(['Patient responded well to treatment', 'Follow-up required', null]),
      review_status: randomItem(reviewStatuses),
      ...(global.DEMO_USER_ID && { submitted_by: global.DEMO_USER_ID }),
      is_active: true
    };
    cautiCases.push(caseData);
  }

  const { data, error} = await supabase
    .from('cauti_surveillance')
    .insert(cautiCases)
    .select();

  if (error) {
    console.error('❌ Error inserting CAUTI data:', error.message);
    return 0;
  }

  console.log(`✅ Created ${data.length} CAUTI cases`);
  return data.length;
}

// Generate CLABSI dummy data
async function generateClabsiData() {
  console.log('\n📊 Generating CLABSI cases...');
  const clabsiCases = [];

  for (let i = 0; i < 7; i++) {
    const surveillanceDate = randomDate(6);
    const caseData = {
      patient_name: randomItem(patientNames),
      hospital_id: 'HMH001',
      age: 30 + Math.floor(Math.random() * 55),
      gender: randomItem(['Male', 'Female']),
      ward_bed_number: `${randomItem(wards)} - Bed ${randomItem(bedNumbers)}`,
      department: randomItem(['ICU', 'GENERAL_SURGERY', 'INTERNAL_MEDICINE', 'PEDIATRICS']),
      line_insertion_date: randomDate(7),
      line_removal_date: Math.random() > 0.5 ? randomDate(5) : null,
      line_type: randomItem(['PICC', 'CVC', 'Tunneled catheter', 'Implanted port']),
      insertion_site: randomItem(['Internal Jugular', 'Subclavian', 'Femoral', 'Peripheral']),
      number_of_lumens: randomItem([1, 2, 3]),
      reason_for_line: randomItem(['Medication administration', 'TPN', 'Chemotherapy', 'Vasopressors']),
      surveillance_date: surveillanceDate,
      bloodstream_infection_date: surveillanceDate,
      symptoms: {
        fever: Math.random() > 0.4,
        chills: Math.random() > 0.5,
        hypotension: Math.random() > 0.6,
        altered_mental_status: Math.random() > 0.7,
        exit_site_erythema: Math.random() > 0.5
      },
      laboratory_findings: {
        positive_blood_culture: Math.random() > 0.3,
        elevated_wbc: Math.random() > 0.4,
        elevated_crp: Math.random() > 0.5,
        positive_tip_culture: Math.random() > 0.6
      },
      meets_clabsi_criteria: Math.random() > 0.4,
      secondary_bsi: Math.random() > 0.7,
      infection_preventable: Math.random() > 0.5,
      contributing_factors: randomItem(['Inadequate line care', 'Prolonged catheterization', 'Multiple lumens', null]),
      notes: randomItem(['Line removed after positive culture', 'Patient improving on antibiotics', null]),
      review_status: randomItem(reviewStatuses),
      ...(global.DEMO_USER_ID && { submitted_by: global.DEMO_USER_ID }),
      is_active: true
    };
    clabsiCases.push(caseData);
  }

  const { data, error } = await supabase
    .from('clabsi_surveillance')
    .insert(clabsiCases)
    .select();

  if (error) {
    console.error('❌ Error inserting CLABSI data:', error.message);
    return 0;
  }

  console.log(`✅ Created ${data.length} CLABSI cases`);
  return data.length;
}

// Generate MDR dummy data
async function generateMdrData() {
  console.log('\n📊 Generating MDR cases...');
  const mdrCases = [];

  for (let i = 0; i < 9; i++) {
    const reportDate = randomDate(6);
    const caseData = {
      hospital_id: 'HMH001',
      full_name: randomItem(patientNames),
      age: 40 + Math.floor(Math.random() * 50),
      sex: randomItem(['Male', 'Female']),
      ward_unit: randomItem(wards),
      consultant_in_charge: randomItem(['Dr. Ahmed', 'Dr. Fatima', 'Dr. Hassan', 'Dr. Mariyam']),
      admission_date: randomDate(7),
      diagnosis: randomItem([
        'Sepsis', 'Pneumonia', 'Urinary Tract Infection',
        'Wound Infection', 'Respiratory Infection'
      ]),
      site_of_infection: randomItem(['Respiratory', 'Urinary', 'Wound', 'Blood', 'Other']),
      sample_type: randomItem(['Blood', 'Urine', 'Sputum', 'Wound swab', 'Tracheal aspirate']),
      sample_collection_date: randomDate(6),
      report_date: reportDate,
      pathogen_isolated: randomItem(organisms),
      antibiotic_resistant_to: randomItem([
        'Methicillin, Ceftriaxone',
        'Vancomycin, Gentamicin',
        'Carbapenem, Piperacillin',
        'Multiple beta-lactams'
      ]),
      antibiotic_sensitive_to: randomItem(antibiotics),
      mdr_organism_type: randomItem(['MRSA', 'ESBL', 'CRE', 'VRE', 'MDR-TB', 'Other']),
      outcome: randomItem(['Recovered', 'Ongoing Treatment', 'Expired', 'Discharged Against Medical Advice']),
      outcome_date: randomDate(3),
      reported_by: randomItem(['Nurse Ahmed', 'Nurse Fatima', 'Dr. Hassan']),
      report_submission_date: reportDate,
      empiric_antibiotics: randomItem(antibiotics),
      empiric_antibiotics_start_date: randomDate(6),
      culture_specific_antibiotics: randomItem(antibiotics),
      date_modified: randomDate(5),
      isolation_implemented: randomItem(['Yes', 'No']),
      isolation_implementation_date: randomDate(6),
      type_of_precaution: randomItem(['Contact', 'Droplet', 'Airborne', 'Other']),
      designation: randomItem(['Registered Nurse', 'Senior Nurse', 'IPC Nurse']),
      contact_info: randomItem(['+960-123-4567', '+960-987-6543']),
      risk_factors: {},
      ...(global.DEMO_USER_ID && { created_by: global.DEMO_USER_ID })
    };
    mdrCases.push(caseData);
  }

  const { data, error } = await supabase
    .from('mdr_surveillance')
    .insert(mdrCases)
    .select();

  if (error) {
    console.error('❌ Error inserting MDR data:', error.message);
    return 0;
  }

  console.log(`✅ Created ${data.length} MDR cases`);
  return data.length;
}

// Main function
async function populateDummyData() {
  console.log('🚀 Starting dummy data population...');
  console.log('====================================\n');

  let totalRecords = 0;

  try {
    // Try to authenticate, but continue even if it fails
    try {
      const userId = await getDemoUser();
      global.DEMO_USER_ID = userId;
    } catch (err) {
      console.warn('⚠️  Authentication failed, inserting without submitted_by field');
      global.DEMO_USER_ID = null;
    }

    // Generate all types of data
    totalRecords += await generateCautiData();
    totalRecords += await generateClabsiData();
    totalRecords += await generateMdrData();

    console.log('\n====================================');
    console.log(`🎉 Successfully created ${totalRecords} total records!`);
    console.log('\n📊 Data Summary:');
    console.log('- CAUTI cases: 8');
    console.log('- CLABSI cases: 7');
    console.log('- MDR cases: 9');
    console.log('\n✨ Your dashboard should now show populated data and graphs!');
    console.log('🌐 Visit http://localhost:3000 to see the results');

  } catch (error) {
    console.error('\n❌ Error populating dummy data:', error);
    process.exit(1);
  }
}

// Run the population
populateDummyData();
