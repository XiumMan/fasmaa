// src/components/forms/MdrForm.tsx
'use client'

import React, { useState } from 'react';
// FIX: Import specific types from react-hook-form
import { useForm, SubmitHandler, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
    Save, AlertCircle, CheckCircle, User, Stethoscope, Microscope, Beaker, ShieldCheck, HeartPulse, FileSignature, Home, ClipboardList 
} from 'lucide-react';

// --- FORM SCHEMA (Zod for validation) ---
const mdrSchema = z.object({
  hospital_id: z.string().min(1, "Hospital ID is required"),
  full_name: z.string().min(3, "Full name is required"),
  // FIX: Add a .default(0) to handle empty inputs safely, ensuring the type is always a number.
  age: z.coerce.number().default(0).refine(n => n >= 0, "Age cannot be negative"),
  sex: z.enum(['Male', 'Female']),
  ward_unit: z.string().min(1, "Ward/Unit is required"),
  consultant_in_charge: z.string().min(1, "Consultant is required"),
  admission_date: z.string().min(1, "Admission date is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  site_of_infection: z.enum(['Respiratory', 'Urinary', 'Wound', 'Blood', 'Other']),
  sample_type: z.string().min(1, "Sample type is required"),
  sample_collection_date: z.string().min(1, "Sample collection date is required"),
  report_date: z.string().min(1, "Report date is required"),
  pathogen_isolated: z.string().min(1, "Pathogen is required"),
  antibiotic_resistant_to: z.string().min(1, "Resistance information is required"),
  antibiotic_sensitive_to: z.string().min(1, "Sensitivity information is required"),
  mdr_organism_type: z.enum(['MRSA', 'ESBL', 'CRE', 'VRE', 'MDR-TB', 'Other']),
  outcome: z.enum(['Recovered', 'Ongoing Treatment', 'Expired', 'Discharged Against Medical Advice']),
  outcome_date: z.string().min(1, "Outcome date is required"),
  reported_by: z.string().min(1, "Your name is required"),
  report_submission_date: z.string(),
  empiric_antibiotics: z.string().optional(),
  empiric_antibiotics_start_date: z.string().optional(),
  culture_specific_antibiotics: z.string().optional(),
  date_modified: z.string().optional(),
  isolation_implemented: z.enum(['Yes', 'No']).optional(),
  isolation_implementation_date: z.string().optional(),
  type_of_precaution: z.enum(['Contact', 'Droplet', 'Airborne', 'Other']).optional(),
  designation: z.string().optional(),
  contact_info: z.string().optional(),
});

type MdrFormData = z.infer<typeof mdrSchema>;

// --- HELPER COMPONENTS (for consistent UI) ---
const FormSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Icon className="w-5 h-5 mr-3 text-blue-600" />{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
);

// FIX: Use UseFormRegister<MdrFormData> instead of 'any' for type safety.
const InputField: React.FC<{ register: UseFormRegister<MdrFormData>; name: keyof MdrFormData; label: string; type?: string; error?: string; className?: string }> = ({ register, name, label, type = 'text', error, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={name} type={type} {...register(name)} className={`w-full border rounded-md px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`} />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

// FIX: Use UseFormRegister<MdrFormData> instead of 'any' for type safety.
const SelectField: React.FC<{ register: UseFormRegister<MdrFormData>; name: keyof MdrFormData; label: string; error?: string; children: React.ReactNode; className?: string }> = ({ register, name, label, error, children, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select id={name} {...register(name)} className={`w-full border rounded-md px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}>
            {children}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

interface MdrFormProps {
  handleSectionChange: (section: string) => void;
}

export default function MdrForm({ handleSectionChange }: MdrFormProps) {
  const { user, userName, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MdrFormData>({
    resolver: zodResolver(mdrSchema),
    defaultValues: {
      reported_by: userName || '',
      designation: profile?.role || '',
      report_submission_date: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit: SubmitHandler<MdrFormData> = async (data) => {
    setLoading(true);
    setFormStatus(null);
    try {
      const payload = {
        ...data,
        created_by: user?.id,
        risk_factors: {}, 
      };
      
      const { error: insertError } = await supabase.from('mdr_surveillance').insert([payload]);
      if (insertError) throw insertError;

      setFormStatus({ type: 'success', message: 'MDR Surveillance Form submitted successfully!' });
      reset({
        reported_by: userName || '',
        designation: profile?.role || '',
        report_submission_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error("Error submitting MDR form:", err);
      const error = err as Error;
      setFormStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">MDR Resistance Case Reporting Form</h1>
            <div className="flex items-center gap-2">
                <button onClick={() => handleSectionChange('forms')} className="flex items-center px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"><ClipboardList className="h-4 w-4 mr-2" />View All Forms</button>
                <button onClick={() => handleSectionChange('dashboard')} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"><Home className="h-4 w-4 mr-2" />Return to Dashboard</button>
            </div>
        </div>
      
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {formStatus && (
                <div className={`p-4 rounded-md text-sm ${formStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <div className="flex"><div className="flex-shrink-0">{formStatus.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}</div><div className="ml-3"><p>{formStatus.message}</p></div></div>
                </div>
            )}

            <FormSection title="Patient Information" icon={User}>
                <InputField register={register} name="hospital_id" label="Hospital ID" error={errors.hospital_id?.message} />
                <InputField register={register} name="full_name" label="Full Name" error={errors.full_name?.message} />
                <InputField register={register} name="age" label="Age" type="number" error={errors.age?.message} />
                <SelectField register={register} name="sex" label="Sex" error={errors.sex?.message}><option value="">Select Sex...</option><option value="Male">Male</option><option value="Female">Female</option></SelectField>
                <InputField register={register} name="ward_unit" label="Ward / Unit" error={errors.ward_unit?.message} />
                <InputField register={register} name="consultant_in_charge" label="Consultant In-Charge" error={errors.consultant_in_charge?.message} />
            </FormSection>

            <FormSection title="Clinical Details" icon={Stethoscope}>
                <InputField register={register} name="admission_date" label="Admission Date" type="date" error={errors.admission_date?.message} />
                <InputField register={register} name="diagnosis" label="Primary Diagnosis" error={errors.diagnosis?.message} />
                <SelectField register={register} name="site_of_infection" label="Site of Infection" error={errors.site_of_infection?.message}><option value="">Select Site...</option><option value="Respiratory">Respiratory</option><option value="Urinary">Urinary</option><option value="Wound">Wound</option><option value="Blood">Blood</option><option value="Other">Other</option></SelectField>
            </FormSection>

            <FormSection title="Microbiological Information" icon={Microscope}>
                <InputField register={register} name="sample_type" label="Sample Type (e.g., Blood, Urine)" error={errors.sample_type?.message} />
                <InputField register={register} name="pathogen_isolated" label="Pathogen Isolated" error={errors.pathogen_isolated?.message} />
                <SelectField register={register} name="mdr_organism_type" label="MDR Organism Type" error={errors.mdr_organism_type?.message}><option value="">Select Type...</option><option value="MRSA">MRSA</option><option value="ESBL">ESBL</option><option value="CRE">CRE</option><option value="VRE">VRE</option><option value="MDR-TB">MDR-TB</option><option value="Other">Other</option></SelectField>
                <InputField register={register} name="sample_collection_date" label="Sample Collection Date" type="date" error={errors.sample_collection_date?.message} />
                <InputField register={register} name="report_date" label="Lab Report Date" type="date" error={errors.report_date?.message} />
                <InputField register={register} name="antibiotic_resistant_to" label="Antibiotics Resistant To" error={errors.antibiotic_resistant_to?.message} className="lg:col-span-3" />
                <InputField register={register} name="antibiotic_sensitive_to" label="Antibiotics Sensitive To" error={errors.antibiotic_sensitive_to?.message} className="lg:col-span-3" />
            </FormSection>

            <FormSection title="Treatment Information" icon={Beaker}>
                <InputField register={register} name="empiric_antibiotics" label="Empiric Antibiotics Given" />
                <InputField register={register} name="empiric_antibiotics_start_date" label="Start Date" type="date" />
                <InputField register={register} name="culture_specific_antibiotics" label="Culture-Specific Antibiotics" />
                <InputField register={register} name="date_modified" label="Date Modified" type="date" />
            </FormSection>

            <FormSection title="Infection Control" icon={ShieldCheck}>
                <SelectField register={register} name="isolation_implemented" label="Isolation Implemented" ><option value="">Select...</option><option value="Yes">Yes</option><option value="No">No</option></SelectField>
                <InputField register={register} name="isolation_implementation_date" label="Implementation Date" type="date" />
                <SelectField register={register} name="type_of_precaution" label="Type of Precaution"><option value="">Select...</option><option value="Contact">Contact</option><option value="Droplet">Droplet</option><option value="Airborne">Airborne</option><option value="Other">Other</option></SelectField>
            </FormSection>
            
            <FormSection title="Outcome" icon={HeartPulse}>
                <SelectField register={register} name="outcome" label="Patient Outcome" error={errors.outcome?.message}><option value="">Select Outcome...</option><option value="Recovered">Recovered</option><option value="Ongoing Treatment">Ongoing Treatment</option><option value="Expired">Expired</option><option value="Discharged Against Medical Advice">Discharged Against Medical Advice</option></SelectField>
                <InputField register={register} name="outcome_date" label="Outcome Date" type="date" error={errors.outcome_date?.message} />
            </FormSection>

            <FormSection title="Reporting Details" icon={FileSignature}>
                <InputField register={register} name="reported_by" label="Reported By" error={errors.reported_by?.message} />
                <InputField register={register} name="designation" label="Designation" />
                <InputField register={register} name="report_submission_date" label="Submission Date" type="date" error={errors.report_submission_date?.message} />
            </FormSection>

            <div className="flex justify-end p-6 bg-gray-50 border-t rounded-b-lg">
                <button type="submit" disabled={loading} className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto">
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'Submitting...' : 'Submit Form'}
                </button>
            </div>
      </form>
    </div>
  )
}