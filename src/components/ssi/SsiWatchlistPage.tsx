// src/components/ssi/SsiWatchlistPage.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Stethoscope, Plus, AlertCircle, ChevronRight } from 'lucide-react';
import AnalysisModal from '../analytics/AnalysisModal'; // Reuse our modal component
import SsiNewCaseForm from './SsiNewCaseForm'; // Import the new form

// Define the shape of the data we'll fetch
interface SsiCase {
  id: string;
  patient_name: string;
  hospital_id: string;
  procedure_name: string;
  surgeon_name: string;
  suspicion_date: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  current_status: 'SUSPECTED' | 'CONFIRMED' | 'CLOSED_RECOVERED' | 'CLOSED_DECEASED' | 'NOT_AN_SSI';
}

// --- Helper components for styling the list ---
const PriorityTag = ({ priority }: { priority: SsiCase['priority'] }) => {
  const styles = { HIGH: 'bg-red-100 text-red-800', MEDIUM: 'bg-yellow-100 text-yellow-800', LOW: 'bg-green-100 text-green-800' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[priority]}`}>{priority}</span>;
};

const StatusProgressBar = ({ status }: { status: SsiCase['current_status'] }) => {
  const statusInfo = {
    SUSPECTED: { label: 'Suspected', width: '33%', color: 'bg-yellow-400' },
    CONFIRMED: { label: 'Confirmed', width: '66%', color: 'bg-orange-500' },
    CLOSED_RECOVERED: { label: 'Closed - Recovered', width: '100%', color: 'bg-green-500' },
    CLOSED_DECEASED: { label: 'Closed - Deceased', width: '100%', color: 'bg-gray-500' },
    NOT_AN_SSI: { label: 'Not an SSI', width: '100%', color: 'bg-blue-500' },
  };
  const { label, width, color } = statusInfo[status];
  return (
    <div className="w-full">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className={`h-2 rounded-full ${color}`} style={{ width }}></div></div>
    </div>
  );
};

// --- Main Page Component ---
export default function SsiWatchlistPage() {
  const [cases, setCases] = useState<SsiCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false); // State for the modal

  const fetchSsiCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('ssi_cases').select('*').in('current_status', ['SUSPECTED', 'CONFIRMED']).order('priority', { ascending: false }).order('suspicion_date', { ascending: true });
      if (error) throw error;
      setCases(data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSsiCases();
  }, []);

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center"><Stethoscope className="w-7 h-7 mr-3 text-blue-600"/>SSI Watchlist</h1>
            <p className="text-gray-500 mt-1">Active surveillance of suspected and confirmed surgical site infections.</p>
          </div>
          <button
            onClick={() => setIsNewCaseModalOpen(true)} // Open the modal on click
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log New Suspected Case
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* ... (table remains the same as before) ... */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedure / Surgeon</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suspicion Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (<tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading active cases...</td></tr>)}
                  {error && (<tr><td colSpan={6} className="text-center py-10 text-red-600"><AlertCircle className="mx-auto h-6 w-6 mb-2" />Error: {error}</td></tr>)}
                  {!loading && cases.length === 0 && (<tr><td colSpan={6} className="text-center py-10 text-gray-500">No active SSI cases on the watchlist.</td></tr>)}
                  {!loading && cases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{caseItem.patient_name}</div><div className="text-sm text-gray-500">{caseItem.hospital_id}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{caseItem.procedure_name}</div><div className="text-sm text-gray-500">Dr. {caseItem.surgeon_name}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(caseItem.suspicion_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><PriorityTag priority={caseItem.priority} /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusProgressBar status={caseItem.current_status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => alert(`Viewing details for ${caseItem.patient_name}`)} className="text-blue-600 hover:text-blue-900 flex items-center">
                          Details <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>
      
      {/* Add the modal to the page */}
      <AnalysisModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        title="Log New Suspected SSI Case"
      >
        <SsiNewCaseForm 
          onClose={() => setIsNewCaseModalOpen(false)}
          onCaseAdded={fetchSsiCases} // Pass the fetch function to refresh the list
        />
      </AnalysisModal>
    </>
  );
}