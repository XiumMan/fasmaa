// src/components/forms/CautiForm.tsx
'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { CautiSurveillanceInsert, CautiSymptoms, CautiLaboratoryFindings } from '@/types/database'
import { Save, AlertCircle, CheckCircle, Check } from 'lucide-react'

const CustomCheckbox = ({ id, name, checked, onChange, label }: { id: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string }) => (
  <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100">
    <input id={id} name={name} type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    <span className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
      {checked && <Check className="w-3 h-3 text-white" />}
    </span>
    <span className="text-gray-700 select-none">{label}</span>
  </label>
);

const initialState: CautiSurveillanceInsert = {
  surveillance_date: new Date().toISOString().split('T')[0], patient_name: '', hospital_id: '', ward_bed_number: '', department: 'ICU',
  age: 0, gender: null, catheter_insertion_date: '', reason_for_catheter: '',
  symptoms: { fever: false, rigors: false, hypotension: false, confusion_with_leukocytosis: false, costovertebral_pain: false, suprapubic_tenderness: false, testes_epididymis_prostate_pain: false, purulent_discharge: false },
  laboratory_findings: { clean_catch_voided: false, straight_catheter_specimen: false, iuc_specimen: false },
  notes: '',
}

export default function CautiForm() {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState<CautiSurveillanceInsert>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      const [section, key] = name.split('.');
      if (section === 'symptoms' || section === 'laboratory_findings') {
        setFormData(prev => ({ ...prev, [section]: { ...(prev[section] as object), [key]: checked } }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  const validateForm = (): boolean => {
    if (!formData.patient_name || !formData.hospital_id || !formData.ward_bed_number || !formData.catheter_insertion_date) {
        setError('Please fill in all required patient and catheter information.'); return false;
    }
    if (!Object.values(formData.symptoms || {}).some(v => v === true)) {
        setError('Please select at least one sign or symptom.'); return false;
    }
    if (!Object.values(formData.laboratory_findings || {}).some(v => v === true)) {
        setError('Please select at least one laboratory finding.'); return false;
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile || !user) {
        setError("Your user profile is not loaded. Please refresh or contact an administrator."); return;
    }
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: CautiSurveillanceInsert = {
        ...formData,
        submitted_by: profile.id, 
        department: profile.department,
      };

      const { error: insertError } = await supabase.from('cauti_surveillance').insert([payload]);
      if (insertError) throw insertError;

      setSuccess('CAUTI Surveillance Form submitted successfully!');
      setFormData(initialState);
    } catch (err: any) {
      console.error("Error submitting CAUTI form:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Catheter-Associated UTI (CAUTI) Surveillance Form</h2>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                {/* Constrain the width of the form content */}
                <div className="max-w-5xl mx-auto space-y-8">
                    {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"><AlertCircle className="w-5 h-5 text-red-600 mr-3" /><span className="text-red-800">{error}</span></div>}
                    {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-3" /><span className="text-green-800">{success}</span></div>}
                    
                    {/* Section for Patient Info */}
                    <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Surveillance Date</label><input type="date" name="surveillance_date" value={formData.surveillance_date} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm p-2" required/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label><input type="text" name="patient_name" value={formData.patient_name} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm p-2" required/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hospital No.</label><input type="text" name="hospital_id" value={formData.hospital_id} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm p-2" required/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ward/Bed No.</label><input type="text" name="ward_bed_number" value={formData.ward_bed_number} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm p-2" required/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Age</label><input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm p-2" required/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Sex</label><select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm p-2" required><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                        </div>
                    </div>

                    {/* Section for Catheter Info */}
                    <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Catheter Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Catheter Insertion Date</label><input type="date" name="catheter_insertion_date" value={formData.catheter_insertion_date} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm p-2" required/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason for Catheter</label><input type="text" name="reason_for_catheter" value={formData.reason_for_catheter || ''} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm p-2" required/></div>
                        </div>
                    </div>

                    {/* Section for Symptoms & Lab Findings */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Signs and Symptoms</h3>
                            <div className="space-y-2">
                                {Object.keys(initialState.symptoms!).map((key) => (<CustomCheckbox key={key} id={`symptoms.${key}`} name={`symptoms.${key}`} checked={!!formData.symptoms?.[key as keyof CautiSymptoms]} onChange={handleChange} label={key.replace(/_/g, ' ')} />))}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Laboratory Findings</h3>
                            <div className="space-y-2">
                                {Object.keys(initialState.laboratory_findings!).map((key) => (<CustomCheckbox key={key} id={`lab.${key}`} name={`laboratory_findings.${key}`} checked={!!formData.laboratory_findings?.[key as keyof CautiLaboratoryFindings]} onChange={handleChange} label={key.replace(/_/g, ' ')} />))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Section for Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="w-full border-gray-300 rounded-md shadow-sm p-2" placeholder="Enter any additional notes, culture results, etc..."></textarea>
                    </div>
                </div>
            </div>

            <div className="flex justify-end p-6 bg-gray-50 border-t mt-6">
                <button type="button" onClick={() => setFormData(initialState)} className="mr-3 bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center font-semibold"><Save className="w-4 h-4 mr-2" />{loading ? 'Submitting...' : 'Submit Form'}</button>
            </div>
        </form>
    </div>
  )
}