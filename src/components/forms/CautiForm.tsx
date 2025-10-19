// src/components/forms/CautiForm.tsx
'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSimpleAuth } from '@/components/auth/SimpleAuthProvider'
// FIX: Import the DepartmentType enum
import { CautiSurveillanceInsert, CautiSymptoms, CautiLaboratoryFindings, DepartmentType } from '@/types/database'
import { Save, AlertCircle, CheckCircle, Check } from 'lucide-react'
import { Card, SectionHeader, Button, Input } from '@/components/ui/DesignSystem'

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
  surveillance_date: new Date().toISOString().split('T')[0], 
  patient_name: '', 
  hospital_id: '', 
  ward_bed_number: '', 
  // FIX: Use the DepartmentType enum for the default value
  department: DepartmentType.ICU,
  age: 0, 
  gender: null, 
  catheter_insertion_date: '', 
  reason_for_catheter: '',
  symptoms: { fever: false, rigors: false, hypotension: false, confusion_with_leukocytosis: false, costovertebral_pain: false, suprapubic_tenderness: false, testes_epididymis_prostate_pain: false, purulent_discharge: false },
  laboratory_findings: { clean_catch_voided: false, straight_catheter_specimen: false, iuc_specimen: false },
  notes: '',
}

export default function CautiForm() {
  const { user, profile  } = useSimpleAuth()
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
        submitted_by: user.id, // Use user.id for foreign key to auth.users
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
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        title="CAUTI Surveillance Form"
        subtitle="Catheter-Associated Urinary Tract Infection"
      />
        <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Card variant="outlined" padding="md" className="border-red-300 bg-red-50">
                        <div className="flex">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                          <span className="text-red-800 text-sm">{error}</span>
                        </div>
                      </Card>
                    )}
                    {success && (
                      <Card variant="outlined" padding="md" className="border-green-300 bg-green-50">
                        <div className="flex">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                          <span className="text-green-800 text-sm">{success}</span>
                        </div>
                      </Card>
                    )}
                    
                    <Card variant="outlined" padding="lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Input
                              label="Surveillance Date"
                              type="date"
                              value={formData.surveillance_date}
                              onChange={handleChange}
                              required
                            />
                            <Input
                              label="Patient Name"
                              type="text"
                              value={formData.patient_name}
                              onChange={handleChange}
                              required
                            />
                            <Input
                              label="Hospital No."
                              type="text"
                              value={formData.hospital_id}
                              onChange={handleChange}
                              required
                            />
                            <Input
                              label="Ward/Bed No."
                              type="text"
                              value={formData.ward_bed_number}
                              onChange={handleChange}
                              required
                            />
                            <Input
                              label="Age"
                              type="number"
                              value={formData.age || ''}
                              onChange={handleChange}
                              required
                            />
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Sex <span className="text-red-500 ml-1">*</span></label>
                              <select
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10ac84] focus:border-transparent transition-colors"
                                required
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                        </div>
                    </Card>

                    <Card variant="outlined" padding="lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Catheter Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="Catheter Insertion Date"
                              type="date"
                              value={formData.catheter_insertion_date}
                              onChange={handleChange}
                              required
                            />
                            <Input
                              label="Reason for Catheter"
                              type="text"
                              value={formData.reason_for_catheter || ''}
                              onChange={handleChange}
                              required
                            />
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card variant="outlined" padding="lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Signs and Symptoms</h3>
                            <div className="space-y-2">
                                {Object.keys(initialState.symptoms!).map((key) => (<CustomCheckbox key={key} id={`symptoms.${key}`} name={`symptoms.${key}`} checked={!!formData.symptoms?.[key as keyof CautiSymptoms]} onChange={handleChange} label={key.replace(/_/g, ' ')} />))}
                            </div>
                        </Card>
                        <Card variant="outlined" padding="lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Laboratory Findings</h3>
                            <div className="space-y-2">
                                {Object.keys(initialState.laboratory_findings!).map((key) => (<CustomCheckbox key={key} id={`lab.${key}`} name={`laboratory_findings.${key}`} checked={!!formData.laboratory_findings?.[key as keyof CautiLaboratoryFindings]} onChange={handleChange} label={key.replace(/_/g, ' ')} />))}
                            </div>
                        </Card>
                    </div>
                    
                    <Card variant="outlined" padding="lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          name="notes"
                          value={formData.notes || ''}
                          onChange={handleChange}
                          rows={4}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10ac84] focus:border-transparent transition-colors"
                          placeholder="Enter any additional notes, culture results, etc..."
                        ></textarea>
                    </Card>

            <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setFormData(initialState)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  loading={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Form'}
                </Button>
            </div>
        </form>
    </div>
  )
}