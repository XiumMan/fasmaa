// src/types/database.ts
// TypeScript types for HMH IPC Platform database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================
// ENUMS - These match your database enums
// =============================================
// FIX: Converted from type aliases to string enums to provide runtime values for libraries like Zod.

export enum DepartmentType {
  ICU = 'ICU',
  NICU = 'NICU',
  PICU = 'PICU',
  CCU = 'CCU',
  GENERAL_SURGERY = 'GENERAL_SURGERY',
  ORTHOPEDIC = 'ORTHOPEDIC',
  CARDIAC_SURGERY = 'CARDIAC_SURGERY',
  NEUROSURGERY = 'NEUROSURGERY',
  OBSTETRICS_GYNECOLOGY = 'OBSTETRICS_GYNECOLOGY',
  PEDIATRICS = 'PEDIATRICS',
  INTERNAL_MEDICINE = 'INTERNAL_MEDICINE',
  EMERGENCY = 'EMERGENCY',
  DIALYSIS = 'DIALYSIS',
  ONCOLOGY = 'ONCOLOGY',
  BURNS_UNIT = 'BURNS_UNIT',
  LABORATORY = 'LABORATORY',
  RADIOLOGY = 'RADIOLOGY',
  PHARMACY = 'PHARMACY',
  IPC_COMMITTEE = 'IPC_COMMITTEE'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  IPC_FOCAL = 'IPC_FOCAL',
  IPC_OFFICER = 'IPC_OFFICER',
  IPC_COMMITTEE = 'IPC_COMMITTEE',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  CONSULTANT = 'CONSULTANT',
  MEDICAL_OFFICER = 'MEDICAL_OFFICER',
  STAFF_NURSE = 'STAFF_NURSE',
  CHARGE_NURSE = 'CHARGE_NURSE',
  INFECTION_CONTROL_NURSE = 'INFECTION_CONTROL_NURSE',
  LABORATORY_TECHNICIAN = 'LABORATORY_TECHNICIAN',
  VIEWER = 'VIEWER'
}

export enum FormType {
  CAUTI = 'CAUTI',
  CLABSI = 'CLABSI',
  CLABSI_BUNDLE = 'CLABSI_BUNDLE', // Added for the new bundle form
  SSI = 'SSI',
  VAP = 'VAP',
  HAP = 'HAP',
  MDRO = 'MDRO',
  C_DIFF = 'C_DIFF',
  MRSA = 'MRSA',
  VRE = 'VRE',
  ESBL = 'ESBL'
}

export enum ReviewStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  requires_revision = 'requires_revision'
}

// =============================================
// USER PROFILE TYPES
// =============================================

export interface UserProfile {
  id: string
  user_id: string | null
  email: string
  full_name: string
  employee_id: string | null
  phone: string | null
  department: DepartmentType
  role: UserRole
  is_active: boolean | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserProfileInsert {
  id?: string
  user_id?: string | null
  email: string
  full_name: string
  employee_id?: string | null
  phone?: string | null
  department: DepartmentType
  role: UserRole
  is_active?: boolean | null
  avatar_url?: string | null
}

// =============================================
// PATIENT TYPES
// =============================================

export interface Patient {
  id: string
  hospital_id: string
  full_name: string
  date_of_birth: string | null
  gender: 'Male' | 'Female' | 'Other' | null
  phone: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

export interface PatientInsert {
  id?: string
  hospital_id: string
  full_name: string
  date_of_birth?: string | null
  gender?: 'Male' | 'Female' | 'Other' | null
  phone?: string | null
  emergency_contact?: string | null
}

// =============================================
// CAUTI SURVEILLANCE TYPES
// =============================================

// CAUTI Symptoms structure
export interface CautiSymptoms {
  fever: boolean
  rigors: boolean
  hypotension: boolean
  confusion_with_leukocytosis: boolean
  costovertebral_pain: boolean
  suprapubic_tenderness: boolean
  testes_epididymis_prostate_pain: boolean
  purulent_discharge: boolean
}

// CAUTI Laboratory Findings structure
export interface CautiLaboratoryFindings {
  clean_catch_voided: boolean
  straight_catheter_specimen: boolean
  iuc_specimen: boolean
  culture_result?: string
  organism_identified?: string
  cfu_count?: string
  antibiotic_sensitivity?: string
}

export interface CautiSurveillance {
  id: string
  form_number: string
  patient_id: string | null
  patient_name: string
  hospital_id: string
  age: number | null
  gender: 'Male' | 'Female' | null
  ward_bed_number: string
  department: DepartmentType
  catheter_insertion_date: string
  catheter_removal_date: string | null
  reason_for_catheter: string
  catheter_type: string | null
  surveillance_date: string
  event_date: string | null
  symptoms: CautiSymptoms
  laboratory_findings: CautiLaboratoryFindings
  meets_cauti_criteria: boolean | null
  infection_preventable: boolean | null
  contributing_factors: string | null
  notes: string | null
  submitted_by: string | null
  reviewed_by: string | null
  review_status: ReviewStatus
  review_notes: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export interface CautiSurveillanceInsert {
  id?: string
  form_number?: string
  patient_id?: string | null
  patient_name: string
  hospital_id: string
  age?: number | null
  gender?: 'Male' | 'Female' | null
  ward_bed_number: string
  department: DepartmentType
  catheter_insertion_date: string
  catheter_removal_date?: string | null
  reason_for_catheter: string
  catheter_type?: string | null
  surveillance_date: string
  event_date?: string | null
  symptoms?: CautiSymptoms
  laboratory_findings?: CautiLaboratoryFindings
  meets_cauti_criteria?: boolean | null
  infection_preventable?: boolean | null
  contributing_factors?: string | null
  notes?: string | null
  submitted_by?: string | null
  reviewed_by?: string | null
  review_status?: ReviewStatus
  review_notes?: string | null
  is_active?: boolean | null
}

// =============================================
// CLABSI SURVEILLANCE TYPES
// =============================================

// CLABSI Symptoms structure
export interface ClabsiSymptoms {
  fever: boolean
  chills: boolean
  hypotension: boolean
  altered_mental_status: boolean
  line_site_inflammation: boolean
  line_site_purulence: boolean
}

// CLABSI Laboratory Findings structure
export interface ClabsiLaboratoryFindings {
  blood_culture_date?: string
  organism_identified?: string
  culture_source?: string
  antibiotic_sensitivity?: string
  line_tip_culture: boolean
  line_tip_result?: string
}

export interface ClabsiSurveillance {
  id: string
  form_number: string
  patient_id: string | null
  patient_name: string
  hospital_id: string
  age: number | null
  gender: 'Male' | 'Female' | null
  ward_bed_number: string
  department: DepartmentType
  line_insertion_date: string
  line_removal_date: string | null
  line_type: string
  insertion_site: string
  number_of_lumens: number | null
  reason_for_line: string
  surveillance_date: string
  bloodstream_infection_date: string | null
  symptoms: ClabsiSymptoms
  laboratory_findings: ClabsiLaboratoryFindings
  meets_clabsi_criteria: boolean | null
  secondary_bsi: boolean | null
  infection_preventable: boolean | null
  contributing_factors: string | null
  notes: string | null
  submitted_by: string | null
  reviewed_by: string | null
  review_status: ReviewStatus
  review_notes: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export interface ClabsiSurveillanceInsert {
  id?: string
  form_number?: string
  patient_id?: string | null
  patient_name: string
  hospital_id: string
  age?: number | null
  gender?: 'Male' | 'Female' | null
  ward_bed_number: string
  department: DepartmentType
  line_insertion_date: string
  line_removal_date?: string | null
  line_type: string
  insertion_site: string
  number_of_lumens?: number | null
  reason_for_line: string
  surveillance_date: string
  bloodstream_infection_date?: string | null
  symptoms?: ClabsiSymptoms
  laboratory_findings?: ClabsiLaboratoryFindings
  meets_clabsi_criteria?: boolean | null
  secondary_bsi?: boolean | null
  infection_preventable?: boolean | null
  contributing_factors?: string | null
  notes?: string | null
  submitted_by?: string | null
  reviewed_by?: string | null
  review_status?: ReviewStatus
  review_notes?: string | null
  is_active?: boolean | null
}

// =============================================
// PERMISSION TYPES
// =============================================

export interface RolePermission {
  id: string
  role: UserRole
  form_type: FormType
  can_create: boolean | null
  can_read: boolean | null
  can_update: boolean | null
  can_delete: boolean | null
  can_approve: boolean | null
  can_export: boolean | null
  created_at: string
}

export interface DepartmentPermission {
  id: string
  department: DepartmentType
  form_type: FormType
  can_create: boolean | null
  can_read: boolean | null
  can_update: boolean | null
  can_delete: boolean | null
  created_at: string
}

// =============================================
// DASHBOARD TYPES
// =============================================

export interface DashboardStats {
  cautiCases: number
  clabsiCases: number
  ssiCases: number
  mdroCases: number
  thisMonth: number
  totalPatients: number
}

export interface RecentSubmission {
  form_id: string
  form_type: FormType
  patient_name: string
  department: DepartmentType
  ward_bed_number: string
  submission_date: string
  review_status: ReviewStatus
  submitted_by: string
  created_at: string
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// =============================================
// UTILITY TYPES
// =============================================

export interface FormValidationError {
  field: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: FormValidationError[]
}

// =============================================
// DISPLAY NAME MAPPINGS
// =============================================

export const DEPARTMENT_DISPLAY_NAMES: Record<DepartmentType, string> = {
  [DepartmentType.ICU]: 'Intensive Care Unit',
  [DepartmentType.NICU]: 'Neonatal ICU',
  [DepartmentType.PICU]: 'Pediatric ICU',
  [DepartmentType.CCU]: 'Cardiac Care Unit',
  [DepartmentType.GENERAL_SURGERY]: 'General Surgery',
  [DepartmentType.ORTHOPEDIC]: 'Orthopedic',
  [DepartmentType.CARDIAC_SURGERY]: 'Cardiac Surgery',
  [DepartmentType.NEUROSURGERY]: 'Neurosurgery',
  [DepartmentType.OBSTETRICS_GYNECOLOGY]: 'Obstetrics & Gynecology',
  [DepartmentType.PEDIATRICS]: 'Pediatrics',
  [DepartmentType.INTERNAL_MEDICINE]: 'Internal Medicine',
  [DepartmentType.EMERGENCY]: 'Emergency Department',
  [DepartmentType.DIALYSIS]: 'Dialysis Unit',
  [DepartmentType.ONCOLOGY]: 'Oncology',
  [DepartmentType.BURNS_UNIT]: 'Burns Unit',
  [DepartmentType.LABORATORY]: 'Laboratory',
  [DepartmentType.RADIOLOGY]: 'Radiology',
  [DepartmentType.PHARMACY]: 'Pharmacy',
  [DepartmentType.IPC_COMMITTEE]: 'IPC Committee'
}

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.IPC_FOCAL]: 'IPC Focal Person',
  [UserRole.IPC_OFFICER]: 'IPC Officer',
  [UserRole.IPC_COMMITTEE]: 'IPC Committee Member',
  [UserRole.DEPARTMENT_HEAD]: 'Department Head',
  [UserRole.CONSULTANT]: 'Consultant',
  [UserRole.MEDICAL_OFFICER]: 'Medical Officer',
  [UserRole.STAFF_NURSE]: 'Staff Nurse',
  [UserRole.CHARGE_NURSE]: 'Charge Nurse',
  [UserRole.INFECTION_CONTROL_NURSE]: 'Infection Control Nurse',
  [UserRole.LABORATORY_TECHNICIAN]: 'Laboratory Technician',
  [UserRole.VIEWER]: 'Viewer'
}

export const FORM_TYPE_DISPLAY_NAMES: Record<FormType, string> = {
  [FormType.CAUTI]: 'Catheter-Associated UTI',
  [FormType.CLABSI]: 'Central Line-Associated BSI',
  [FormType.CLABSI_BUNDLE]: 'CLABSI Bundle Compliance',
  [FormType.SSI]: 'Surgical Site Infection',
  [FormType.VAP]: 'Ventilator-Associated Pneumonia',
  [FormType.HAP]: 'Hospital-Acquired Pneumonia',
  [FormType.MDRO]: 'Multi-Drug Resistant Organism',
  [FormType.C_DIFF]: 'C. difficile Infection',
  [FormType.MRSA]: 'MRSA Surveillance',
  [FormType.VRE]: 'VRE Surveillance',
  [FormType.ESBL]: 'ESBL Surveillance'
}