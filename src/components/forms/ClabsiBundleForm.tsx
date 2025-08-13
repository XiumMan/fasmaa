// src/components/forms/ClabsiBundleForm.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Database, 
  X, 
  User,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { ClabsiEntry, ClabsiEntryInsert, DischargeType, ShiftType } from '@/types/clabsi';

interface ClabsiFormData {
  patientId: string;
  admissionDate: string;
  admissionShift: ShiftType | '';
  dischargeDate: string;
  dischargeShift: ShiftType | '';
  dischargeType: DischargeType | '';
  entryDate: string;
  shift: ShiftType | '';
  skinPrep2CHG: boolean;
  dressingChangeDaily: boolean;
  patencyLumens: boolean;
  hubCareAlcohol: boolean;
  ivTubingChangeDaily: boolean;
}

interface PatientInfo {
  patientId: string;
  admissionDate: string;
  admissionShift: ShiftType;
  dischargeDate?: string;
  dischargeShift?: ShiftType;
  dischargeType?: DischargeType;
}

interface ModalContent {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function ClabsiBundleForm() {
  const { user, profile, userName } = useAuth();
  
  const [formData, setFormData] = useState<ClabsiFormData>({
    patientId: '', admissionDate: '', admissionShift: '', dischargeDate: '',
    dischargeShift: '', dischargeType: '', entryDate: '', shift: '',
    skinPrep2CHG: false, dressingChangeDaily: false, patencyLumens: false,
    hubCareAlcohol: false, ivTubingChangeDaily: false
  });

  const [savedEntries, setSavedEntries] = useState<ClabsiEntry[]>([]);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [patientHistory, setPatientHistory] = useState<ClabsiEntry[]>([]);
  const [existingPatients, setExistingPatients] = useState<PatientInfo[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [dischargeDataSaved, setDischargeDataSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ type: 'info', message: '' });
  const [showAllEntriesModal, setShowAllEntriesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ClabsiEntry | null>(null);
  
  useEffect(() => {
    if (user?.id) loadSavedEntries();
  }, [user?.id]);

  useEffect(() => {
    const patientsMap = new Map<string, PatientInfo>();
    savedEntries.forEach(entry => {
        if (!patientsMap.has(entry.patient_id)) {
            patientsMap.set(entry.patient_id, {
                patientId: entry.patient_id, admissionDate: entry.admission_date,
                admissionShift: entry.admission_shift, dischargeDate: entry.discharge_date || undefined,
                dischargeShift: entry.discharge_shift || undefined, dischargeType: entry.discharge_type || undefined
            });
        }
    });
    setExistingPatients(Array.from(patientsMap.values()));
  }, [savedEntries]);

  useEffect(() => {
    if (formData.patientId) {
      const existingPatient = existingPatients.find(p => p.patientId === formData.patientId);
      if (existingPatient) {
        setSelectedPatient(existingPatient);
        setFormData(prev => ({ ...prev, admissionDate: existingPatient.admissionDate, admissionShift: existingPatient.admissionShift, dischargeDate: existingPatient.dischargeDate || '', dischargeShift: existingPatient.dischargeShift || '', dischargeType: existingPatient.dischargeType || '' }));
        setDischargeDataSaved(!!existingPatient.dischargeDate);
        const history = savedEntries.filter(entry => entry.patient_id === formData.patientId).sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime() || b.shift.localeCompare(a.shift));
        setPatientHistory(history);
      } else {
        setSelectedPatient(null);
        setDischargeDataSaved(false);
        setPatientHistory([]);
      }
    } else {
      setPatientHistory([]);
    }
  }, [formData.patientId, existingPatients, savedEntries]);
  
  const loadSavedEntries = async () => {
    try {
      const { data, error } = await supabase.from('clabsi_bundle_entries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSavedEntries(data || []);
    } catch (err) {
      showMessage('error', 'Failed to load saved entries.');
    }
  };

  const loadAllEntries = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.from('clabsi_bundle_entries').select('*, created_by_profile:user_profiles(full_name)').order('created_at', { ascending: false });
        if (error) throw error;
        setAllEntries(data || []);
        setShowAllEntriesModal(true);
    } catch (err) {
        console.error('Error loading all entries:', err);
        showMessage('error', 'Failed to load all entries.');
    } finally {
        setLoading(false);
    }
  };

  const calculateDayNumber = () => {
    if (!formData.admissionDate || !formData.entryDate) return 1;
    const admission = new Date(formData.admissionDate);
    const current = new Date(formData.entryDate);
    return Math.ceil(Math.abs(current.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const isAfterDischarge = () => {
    if (!formData.dischargeDate || !formData.entryDate) return false;
    return new Date(formData.entryDate) > new Date(formData.dischargeDate);
  };

  const isAdmissionShift = () => formData.entryDate === formData.admissionDate && formData.shift === formData.admissionShift;
  const getEnteredShifts = () => savedEntries.filter(e => e.patient_id === formData.patientId && e.entry_date === formData.entryDate).map(e => e.shift);

  const calculateCompliance = () => {
      const { skinPrep2CHG, dressingChangeDaily, patencyLumens, hubCareAlcohol, ivTubingChangeDaily } = formData;
      const dayOne = calculateDayNumber() === 1;
      let total = dayOne ? 5 : 4;
      let completed = 0;
      if (dayOne && skinPrep2CHG) completed++;
      if (dressingChangeDaily) completed++;
      if (patencyLumens) completed++;
      if (hubCareAlcohol) completed++;
      if (ivTubingChangeDaily) completed++;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
  };
  
  const showMessage = (type: ModalContent['type'], message: string) => {
    setModalContent({ type, message });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.entryDate || !formData.shift || !formData.admissionDate || !formData.admissionShift) {
        showMessage('error', 'Please fill all required fields.'); return;
    }
    if (getEnteredShifts().includes(formData.shift as ShiftType)) {
        showMessage('error', `Entry for ${formData.shift} shift on this date already exists.`); return;
    }

    setLoading(true);
    const entryData: ClabsiEntryInsert = {
      patient_id: formData.patientId, admission_date: formData.admissionDate, admission_shift: formData.admissionShift as ShiftType,
      discharge_date: formData.dischargeDate || null, discharge_shift: formData.dischargeShift as ShiftType || null, discharge_type: formData.dischargeType as DischargeType || null,
      entry_date: formData.entryDate, shift: formData.shift as ShiftType, day_number: calculateDayNumber(),
      skin_prep_2chg: formData.skinPrep2CHG, dressing_change_daily: formData.dressingChangeDaily, patency_lumens: formData.patencyLumens,
      hub_care_alcohol: formData.hubCareAlcohol, iv_tubing_change_daily: formData.ivTubingChangeDaily,
      compliance_score: calculateCompliance(), created_by: user!.id, department: profile!.department, nurse_name: userName,
    };

    try {
      const { error } = await supabase.from('clabsi_bundle_entries').insert([entryData]);
      if (error) throw error;
      showMessage('success', 'Entry saved successfully!');
      setFormData(prev => ({ ...prev, entryDate: '', shift: '', skinPrep2CHG: false, dressingChangeDaily: false, patencyLumens: false, hubCareAlcohol: false, ivTubingChangeDaily: false }));
      await loadSavedEntries();
    } catch (err) {
      showMessage('error', 'Error saving entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await supabase.from('clabsi_bundle_entries').delete().eq('id', entryToDelete.id);
      showMessage('success', 'Entry deleted successfully!');
      await loadSavedEntries();
    } catch (err) {
      showMessage('error', 'Error deleting entry.');
    } finally {
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">CLABSI Bundle Tracker</h1>
        <div className="flex items-center gap-3">
          <button onClick={loadAllEntries} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"><Database className="h-4 w-4 mr-2" />View All Entries</button>
          <button onClick={() => window.history.back()} className="flex items-center px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"><X className="h-4 w-4 mr-1" />Back</button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center"><User className="h-5 w-5 mr-2" />Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label><input type="text" list="existing-patients-list" value={formData.patientId} onChange={(e) => setFormData(prev => ({...prev, patientId: e.target.value.toUpperCase()}))} className="w-full border border-gray-300 rounded-md px-3 py-2" /><datalist id="existing-patients-list">{existingPatients.map(p => <option key={p.patientId} value={p.patientId} />)}</datalist></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label><input type="date" value={formData.admissionDate} onChange={(e) => setFormData(prev => ({...prev, admissionDate: e.target.value}))} disabled={!!selectedPatient} className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Admission Shift *</label><select value={formData.admissionShift} onChange={(e) => setFormData(prev => ({...prev, admissionShift: e.target.value as ShiftType}))} disabled={!!selectedPatient} className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"><option value="">Select</option><option value="M">Morning</option><option value="A">Afternoon</option><option value="N">Night</option></select></div>
          </div>
          {patientHistory.length > 0 && (<div className="mt-4 pt-4 border-t"><h3 className="text-md font-medium text-gray-800 mb-2">Patient History ({patientHistory.length} entries)</h3><div className="max-h-40 overflow-y-auto space-y-2 pr-2">{patientHistory.map(entry => (<div key={entry.id} className="p-2 border rounded-md bg-gray-50 text-xs flex justify-between items-center"><span><strong>Date:</strong> {entry.entry_date}, <strong>Shift:</strong> {entry.shift}, <strong>Day:</strong> {entry.day_number}</span><span className={`font-semibold ${entry.compliance_score >= 80 ? 'text-green-600' : 'text-red-600'}`}>{entry.compliance_score}%</span></div>))}</div></div>)}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center"><Clock className="h-5 w-5 mr-2" />Current Entry</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Entry Date *</label><input type="date" value={formData.entryDate} onChange={(e) => setFormData(prev => ({...prev, entryDate: e.target.value}))} className="w-full border border-gray-300 rounded-md px-3 py-2"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Shift * <span className="text-blue-500 font-normal text-xs">({getEnteredShifts().length} entered today)</span></label><select value={formData.shift} onChange={(e) => setFormData(prev => ({...prev, shift: e.target.value as ShiftType}))} className="w-full border border-gray-300 rounded-md px-3 py-2"><option value="">Select</option><option value="M">Morning</option><option value="A">Afternoon</option><option value="N">Night</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Day Number</label><div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100">{calculateDayNumber()}</div></div>
           </div>
        </div>

        {formData.patientId && formData.entryDate && formData.shift && !isAfterDischarge() && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">CLABSI Bundle Components</h2>
                <div className="space-y-3">
                  {isAdmissionShift() && <div className="flex items-center"><input type="checkbox" id="skinPrep" checked={formData.skinPrep2CHG} onChange={e => setFormData({...formData, skinPrep2CHG: e.target.checked})} className="h-4 w-4 rounded"/><label htmlFor="skinPrep" className="ml-2">Skin Prep with 2% CHG</label></div>}
                  <div className="flex items-center"><input type="checkbox" id="dressingChange" checked={formData.dressingChangeDaily} onChange={e => setFormData({...formData, dressingChangeDaily: e.target.checked})}/><label htmlFor="dressingChange" className="ml-2">Dressing Change Daily</label></div>
                  <div className="flex items-center"><input type="checkbox" id="patency" checked={formData.patencyLumens} onChange={e => setFormData({...formData, patencyLumens: e.target.checked})} className="h-4 w-4 rounded"/><label htmlFor="patency" className="ml-2">Patency of Lumens</label></div>
                  <div className="flex items-center"><input type="checkbox" id="hubCare" checked={formData.hubCareAlcohol} onChange={e => setFormData({...formData, hubCareAlcohol: e.target.checked})} className="h-4 w-4 rounded"/><label htmlFor="hubCare" className="ml-2">Hub Care with Alcohol</label></div>
                  <div className="flex items-center"><input type="checkbox" id="ivTubing" checked={formData.ivTubingChangeDaily} onChange={e => setFormData({...formData, ivTubingChangeDaily: e.target.checked})}/><label htmlFor="ivTubing" className="ml-2">IV Tubing Change Daily</label></div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                    <div className="flex justify-between items-center"><span className="font-medium text-blue-800">Shift Compliance Score:</span><span className={`font-bold text-lg ${calculateCompliance() >= 80 ? 'text-green-600' : 'text-red-600'}`}>{calculateCompliance()}%</span></div>
                    <p className="text-xs text-blue-600 mt-1">Calculation based on <strong>{calculateDayNumber() === 1 ? '5 components' : '4 components'}</strong> for Day {calculateDayNumber()}.</p>
                </div>
            </div>
        )}

        <div className="flex justify-center pt-4"><button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save Entry'}</button></div>
      </form>
      
      {showModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg max-w-md w-full p-6 text-center"><p className="mb-4">{modalContent.message}</p><button onClick={() => setShowModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded">OK</button></div></div>)}
      {showDeleteConfirm && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg max-w-md w-full p-6"><h3 className="text-lg font-medium mb-4">Confirm Deletion</h3><p>Are you sure you want to delete this entry?</p><div className="flex justify-end gap-4 mt-6"><button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button></div></div></div>)}
      
      {/* FIX: Corrected the JSX for the All Entries Modal table header */}
      {showAllEntriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full h-5/6 flex flex-col">
                <h3 className="text-lg font-medium p-4 border-b">All Entries</h3>
                <div className="flex-1 overflow-y-auto p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allEntries.map((e) => (
                                <tr key={e.id}>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{e.patient_id}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{e.entry_date}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{e.shift}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{e.compliance_score}%</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{e.created_by_profile?.full_name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t flex justify-center">
                    <button onClick={() => setShowAllEntriesModal(false)} className="px-4 py-2 bg-gray-200 rounded">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}