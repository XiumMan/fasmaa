// src/components/ssi/SsiNewCaseForm.tsx
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { DepartmentType } from '@/types/database';
import { Save } from 'lucide-react';

// Define the surgical departments that can be selected
const surgicalDepartments = {
    [DepartmentType.GENERAL_SURGERY]: 'General Surgery',
    [DepartmentType.OBSTETRICS_GYNECOLOGY]: 'Obstetrics & Gynecology',
    [DepartmentType.ORTHOPEDIC]: 'Orthopedic',
    [DepartmentType.CARDIAC_SURGERY]: 'Cardiac Surgery',
    [DepartmentType.NEUROSURGERY]: 'Neurosurgery',
};

// Define the validation schema for the form
const ssiCaseSchema = z.object({
  patient_name: z.string().min(3, "Patient name is required"),
  hospital_id: z.string().min(1, "Hospital ID is required"),
  department: z.nativeEnum(DepartmentType),
  procedure_name: z.string().min(3, "Procedure name is required"),
  procedure_date: z.string().min(1, "Procedure date is required"),
  surgeon_name: z.string().optional(),
  suspicion_date: z.string().min(1, "Suspicion date is required"),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

type SsiCaseFormData = z.infer<typeof ssiCaseSchema>;

interface SsiNewCaseFormProps {
  onClose: () => void;
  onCaseAdded: () => void; // Callback to refresh the list
}

export default function SsiNewCaseForm({ onClose, onCaseAdded }: SsiNewCaseFormProps) {
  const { user } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SsiCaseFormData>({
    resolver: zodResolver(ssiCaseSchema),
    defaultValues: {
      priority: 'MEDIUM',
      suspicion_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: SsiCaseFormData) => {
    try {
      const { error } = await supabase.from('ssi_cases').insert({
        ...data,
        created_by: user?.id,
        current_status: 'SUSPECTED',
      });

      if (error) throw error;
      
      onCaseAdded(); // Trigger the refresh
      onClose(); // Close the modal
    } catch (err: any) {
      console.error("Error creating SSI case:", err);
      // Here you could add a state to show an error message to the user
      alert("Failed to create case: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Patient Info */}
        <div className="sm:col-span-2 font-semibold text-gray-700 border-b pb-2 mb-2">Patient Details</div>
        <div>
          <label className="block text-sm font-medium">Patient Name</label>
          <input {...register('patient_name')} className={`w-full border rounded-md p-2 ${errors.patient_name ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.patient_name && <p className="text-red-500 text-xs mt-1">{errors.patient_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Hospital ID</label>
          <input {...register('hospital_id')} className={`w-full border rounded-md p-2 ${errors.hospital_id ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.hospital_id && <p className="text-red-500 text-xs mt-1">{errors.hospital_id.message}</p>}
        </div>

        {/* Surgical Info */}
        <div className="sm:col-span-2 font-semibold text-gray-700 border-b pb-2 mb-2 mt-4">Surgical Details</div>
        <div>
          <label className="block text-sm font-medium">Procedure Name</label>
          <input {...register('procedure_name')} className={`w-full border rounded-md p-2 ${errors.procedure_name ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.procedure_name && <p className="text-red-500 text-xs mt-1">{errors.procedure_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Department</label>
          <select {...register('department')} className={`w-full border rounded-md p-2 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}>
            <option value="">Select Department...</option>
            {Object.entries(surgicalDepartments).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
            ))}
          </select>
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
        </div>
         <div>
          <label className="block text-sm font-medium">Procedure Date</label>
          <input type="date" {...register('procedure_date')} className={`w-full border rounded-md p-2 ${errors.procedure_date ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.procedure_date && <p className="text-red-500 text-xs mt-1">{errors.procedure_date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Surgeon Name (Optional)</label>
          <input {...register('surgeon_name')} className="w-full border rounded-md p-2 border-gray-300" />
        </div>
        
        {/* Surveillance Info */}
        <div className="sm:col-span-2 font-semibold text-gray-700 border-b pb-2 mb-2 mt-4">Surveillance Details</div>
        <div>
          <label className="block text-sm font-medium">Suspicion Date</label>
          <input type="date" {...register('suspicion_date')} className={`w-full border rounded-md p-2 ${errors.suspicion_date ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.suspicion_date && <p className="text-red-500 text-xs mt-1">{errors.suspicion_date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Priority</label>
          <select {...register('priority')} className={`w-full border rounded-md p-2 ${errors.priority ? 'border-red-500' : 'border-gray-300'}`}>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="LOW">Low</option>
          </select>
          {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-6 border-t">
        <button type="button" onClick={onClose} className="mr-3 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Case'}
        </button>
      </div>
    </form>
  );
}   