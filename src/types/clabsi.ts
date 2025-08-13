// src/types/clabsi.ts

import { DepartmentType } from './database'

// Basic enums for CLABSI tracking
export type ShiftType = 'M' | 'A' | 'N' // Morning, Afternoon, Night
export type DischargeType = 'discharged' | 'deceased' | 'transferred'

// Core CLABSI Entry structure from Supabase
export interface ClabsiEntry {
  id: string
  patient_id: string
  admission_date: string
  admission_shift: ShiftType
  discharge_date: string | null
  discharge_shift: ShiftType | null
  discharge_type: DischargeType | null
  entry_date: string
  shift: ShiftType
  day_number: number
  
  // Bundle components
  skin_prep_2chg: boolean
  dressing_change_daily: boolean
  patency_lumens: boolean
  hub_care_alcohol: boolean
  iv_tubing_change_daily: boolean
  
  // Metadata
  compliance_score: number
  created_by: string
  department: DepartmentType
  nurse_name: string
  created_at: string
  updated_at: string
}

// Insert type for creating new entries
export interface ClabsiEntryInsert {
  patient_id: string
  admission_date: string
  admission_shift: ShiftType
  discharge_date?: string | null
  discharge_shift?: ShiftType | null
  discharge_type?: DischargeType | null
  entry_date: string
  shift: ShiftType
  day_number: number
  
  // Bundle components
  skin_prep_2chg: boolean
  dressing_change_daily: boolean
  patency_lumens: boolean
  hub_care_alcohol: boolean
  iv_tubing_change_daily: boolean
  
  // Metadata
  compliance_score: number
  created_by: string
  department: DepartmentType
  nurse_name: string
}

// Update type for editing entries
export interface ClabsiEntryUpdate {
  patient_id?: string
  admission_date?: string
  admission_shift?: ShiftType
  discharge_date?: string | null
  discharge_shift?: ShiftType | null
  discharge_type?: DischargeType | null
  entry_date?: string
  shift?: ShiftType
  day_number?: number
  
  // Bundle components
  skin_prep_2chg?: boolean
  dressing_change_daily?: boolean
  patency_lumens?: boolean
  hub_care_alcohol?: boolean
  iv_tubing_change_daily?: boolean
  
  // Metadata
  compliance_score?: number
  updated_at?: string
}

// Patient overview for dropdowns and selection
export interface ClabsiPatient {
  patientId: string
  admissionDate: string
  admissionShift: ShiftType
  dischargeDate?: string
  dischargeShift?: ShiftType
  dischargeType?: DischargeType
  totalEntries: number
  overallCompliance: number
  isActive: boolean
}

// Dashboard statistics for CLABSI
export interface ClabsiStats {
  totalCases: number
  activeCases: number
  completedCases: number
  averageCompliance: number
  thisMonthEntries: number
  lowComplianceCases: number
  perfectComplianceCases: number
}

// Compliance breakdown by component
export interface ComplianceBreakdown {
  skinPrep: {
    completed: number
    total: number
    percentage: number
  }
  dressingChange: {
    completed: number
    total: number
    percentage: number
  }
  patencyCheck: {
    completed: number
    total: number
    percentage: number
  }
  hubCare: {
    completed: number
    total: number
    percentage: number
  }
  ivTubingChange: {
    completed: number
    total: number
    percentage: number
  }
}

// Form validation errors
export interface ClabsiFormErrors {
  patientId?: string
  admissionDate?: string
  admissionShift?: string
  currentDate?: string
  shift?: string
  general?: string
}

// Filter options for lists
export interface ClabsiFilters {
  department?: DepartmentType
  dateFrom?: string
  dateTo?: string
  shift?: ShiftType
  complianceMin?: number
  complianceMax?: number
  patientId?: string
  nurse?: string
  discharged?: boolean
}

// Sort options for tables
export type ClabsiSortField = 
  | 'patient_id' 
  | 'entry_date' 
  | 'shift' 
  | 'day_number' 
  | 'compliance_score' 
  | 'created_at'

export type SortDirection = 'asc' | 'desc'

export interface ClabsiSort {
  field: ClabsiSortField
  direction: SortDirection
}

// Pagination for large datasets
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// API response structure
export interface ClabsiApiResponse<T> {
  data: T
  pagination?: Pagination
  error?: string
  message?: string
}

// Bundle component definitions for UI
export interface BundleComponent {
  id: keyof Pick<ClabsiEntry, 'skin_prep_2chg' | 'dressing_change_daily' | 'patency_lumens' | 'hub_care_alcohol' | 'iv_tubing_change_daily'>
  name: string
  description: string
  frequency: 'admission' | 'daily' | 'shift'
  required: boolean
  icon?: string
}

// Export bundle component definitions
export const CLABSI_BUNDLE_COMPONENTS: BundleComponent[] = [
  {
    id: 'skin_prep_2chg',
    name: 'Skin Preparation with 2% CHG',
    description: 'Chlorhexidine gluconate skin preparation',
    frequency: 'admission',
    required: true
  },
  {
    id: 'dressing_change_daily',
    name: 'Dressing Change',
    description: 'Daily sterile dressing change',
    frequency: 'daily',
    required: true
  },
  {
    id: 'patency_lumens',
    name: 'Patency Check',
    description: 'Check patency of all lumens',
    frequency: 'shift',
    required: true
  },
  {
    id: 'hub_care_alcohol',
    name: 'Hub Care with Alcohol',
    description: 'Disinfect all hubs with alcohol',
    frequency: 'shift',
    required: true
  },
  {
    id: 'iv_tubing_change_daily',
    name: 'IV Tubing Change',
    description: 'Daily IV tubing set change',
    frequency: 'daily',
    required: true
  }
]

// Compliance thresholds
export const COMPLIANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  FAIR: 60,
  POOR: 0
} as const

// Shift display names
export const SHIFT_DISPLAY_NAMES: Record<ShiftType, string> = {
  M: 'Morning',
  A: 'Afternoon', 
  N: 'Night'
}

// Discharge type display names
export const DISCHARGE_TYPE_DISPLAY_NAMES: Record<DischargeType, string> = {
  discharged: 'Discharged',
  deceased: 'Deceased',
  transferred: 'Transferred'
}

// Helper type for grouped entries (by date, patient, etc.)
export interface GroupedClabsiEntries {
  [key: string]: ClabsiEntry[]
}

// Type for analytics/reporting
export interface ClabsiReport {
  period: {
    start: string
    end: string
  }
  summary: ClabsiStats
  complianceBreakdown: ComplianceBreakdown
  patientList: ClabsiPatient[]
  departmentBreakdown: Record<DepartmentType, ClabsiStats>
  trends: {
    date: string
    compliance: number
    entries: number
  }[]
}

// Export utility functions as types for consistency
export type ComplianceCalculator = (entry: ClabsiEntry) => number
export type DayNumberCalculator = (admissionDate: string, entryDate: string) => number

// Modal and UI state types
export interface ModalState {
  isOpen: boolean
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
}

export interface LoadingState {
  isLoading: boolean
  operation?: string
  progress?: number
}

// Form state management
export interface ClabsiFormState {
  data: Partial<ClabsiEntryInsert>
  errors: ClabsiFormErrors
  loading: LoadingState
  modal: ModalState
  validation: {
    isValid: boolean
    touchedFields: Set<string>
  }
}