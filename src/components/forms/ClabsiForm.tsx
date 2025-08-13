// src/components/forms/ClabsiForm.tsx
'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
// FIX: Import the ReviewStatus enum
import { DEPARTMENT_DISPLAY_NAMES, DepartmentType, ClabsiSurveillanceInsert, ReviewStatus } from '@/types/database';
import { 
    AlertTriangle, CheckCircle, Save, User, Syringe, TestTube2, 
    Microscope, FileText, Home, ClipboardList 
} from 'lucide-react';

// --- HELPER COMPONENTS ---
const FormSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Icon className="w-5 h-5 mr-3 text-blue-600" />{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
);

const InputField: React.FC<{ register: any; name: string; label: string; type?: string; error?: string }> = ({ register, name, label, type = 'text', error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={name} type={type} {...register(name)} className={`w-full border rounded-md px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`} />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const CheckboxField: React.FC<{ register: any; name: string; label: string }> = ({ register, name, label }) => (
    <div className="flex items-center space-x-2 pt-2">
      <input type="checkbox" id={name} {...register(name)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
      <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    </div>
);

// --- ZOD SCHEMA ---
const clabsiSchema = z.object({
  patient_name: z.string().min(3, "Patient name is required"),
  hospital_id: z.string().min(1, "Hospital ID is required"),
  ward_bed_number: z.string().min(1, "Ward/Bed number is required"),
  department: z.nativeEnum(DepartmentType, { 
    message: "Please select a valid department.",
  }),
  line_insertion_date: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "A valid date is required" }),
  line_type: z.string().min(1, "Line type is required"),
  insertion_site: z.string().min(1, "Insertion site is required"),
  surveillance_date: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "A valid date is required" }),
  bloodstream_infection_date: z.string().optional(),
  symptoms: z.object({
    fever: z.boolean(),
    chills: z.boolean(),
    hypotension: z.boolean(),
  }),
  laboratory_findings: z.object({
    blood_culture_date: z.string().optional(),
    organism_identified: z.string().optional(),
    culture_source: z.string().optional(),
  }),
  meets_clabsi_criteria: z.boolean(),
  notes: z.string().optional(),
});

type ClabsiFormData = z.infer<typeof clabsiSchema>;

// --- COMPONENT PROPS ---
interface ClabsiFormProps {
  handleSectionChange: (section: string) => void;
}

// --- MAIN FORM COMPONENT ---
export default function ClabsiForm({ handleSectionChange }: ClabsiFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClabsiFormData>({
    resolver: zodResolver(clabsiSchema),
    defaultValues: {
        patient_name: '',
        hospital_id: '',
        ward_bed_number: '',
        department: undefined,
        line_insertion_date: '',
        line_type: '',
        insertion_site: '',
        surveillance_date: new Date().toISOString().split('T')[0],
        bloodstream_infection_date: '',
        symptoms: { fever: false, chills: false, hypotension: false },
        laboratory_findings: {
            blood_culture_date: '',
            organism_identified: '',
            culture_source: ''
        },
        meets_clabsi_criteria: false,
        notes: ''
    }
  });

  const onSubmit = async (data: ClabsiFormData) => {
    if (!user) {
      setFormStatus({ type: 'error', message: 'You must be logged in to submit.' });
      return;
    }
    setLoading(true);
    setFormStatus(null);

    const submissionData: ClabsiSurveillanceInsert = {
      ...data,
      reason_for_line: '',
      submitted_by: user.id,
      // FIX: Use the ReviewStatus enum instead of a plain string
      review_status: ReviewStatus.pending,
    };

    try {
      const { error } = await supabase.from('clabsi_surveillance').insert([submissionData]);
      if (error) throw error;
      setFormStatus({ type: 'success', message: 'CLABSI Surveillance Form submitted successfully!' });
      reset(); 
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setFormStatus({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">CLABSI Incidence Form</h1>
        
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleSectionChange('forms')}
                className="flex items-center px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"
            >
                <ClipboardList className="h-4 w-4 mr-2" />
                View All Forms
            </button>
            <button
                onClick={() => handleSectionChange('dashboard')}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
            >
                <Home className="h-4 w-4 mr-2" />
                Return to Dashboard
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Patient Demographics" icon={User}>
            <InputField register={register} name="patient_name" label="Patient Name" error={errors.patient_name?.message} />
            <InputField register={register} name="hospital_id" label="Hospital ID" error={errors.hospital_id?.message} />
            <InputField register={register} name="ward_bed_number" label="Ward / Bed Number" error={errors.ward_bed_number?.message} />
             <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select id="department" {...register("department")} className={`w-full border rounded-md px-3 py-2 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select Department...</option>
                    {Object.values(DepartmentType).map((value) => (
                        <option key={value} value={value}>{DEPARTMENT_DISPLAY_NAMES[value]}</option>
                    ))}
                </select>
                 {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
            </div>
        </FormSection>

        <FormSection title="Central Line Information" icon={Syringe}>
            <InputField register={register} name="line_insertion_date" label="Line Insertion Date" type="date" error={errors.line_insertion_date?.message} />
            <InputField register={register} name="line_type" label="Catheter Type (e.g., CVC, PICC)" error={errors.line_type?.message} />
            <InputField register={register} name="insertion_site" label="Insertion Site (e.g., Subclavian)" error={errors.insertion_site?.message} />
            <InputField register={register} name="surveillance_date" label="Surveillance Date" type="date" error={errors.surveillance_date?.message} />
        </FormSection>

        <FormSection title="Clinical Symptoms" icon={Microscope}>
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              <CheckboxField register={register} name="symptoms.fever" label="Fever (>38°C)" />
              <CheckboxField register={register} name="symptoms.chills" label="Chills" />
              <CheckboxField register={register} name="symptoms.hypotension" label="Hypotension" />
          </div>
        </FormSection>

        <FormSection title="Laboratory Findings" icon={TestTube2}>
          <InputField register={register} name="laboratory_findings.blood_culture_date" label="Blood Culture Date" type="date" />
          <InputField register={register} name="laboratory_findings.organism_identified" label="Organism Identified" />
          <InputField register={register} name="laboratory_findings.culture_source" label="Culture Source (e.g., Peripheral, Line)" />
          <InputField register={register} name="bloodstream_infection_date" label="Bloodstream Infection (BSI) Date" type="date" />
        </FormSection>

        <FormSection title="Final Assessment" icon={FileText}>
          <div className="md:col-span-2">
            <CheckboxField register={register} name="meets_clabsi_criteria" label="Patient meets criteria for CLABSI diagnosis" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea id="notes" {...register("notes")} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
          </div>
        </FormSection>

        {formStatus && (
          <div className={`p-4 rounded-md text-sm ${formStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {formStatus.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              </div>
              <div className="ml-3">
                <p>{formStatus.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto">
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  );
}