// src/components/forms/FormsPage.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, AlertCircle, Plus, ChevronDown, Download, Eye, LucideIcon } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { getStatusBadgeColor } from '@/hooks/useDashboard';
import AnalysisModal from '../analytics/AnalysisModal';
import EntryViewer from '../common/EntryViewer';

// Define the shape of the FormType prop passed from MainDashboard
interface FormTypeProp {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    bgColor: string;
    iconColor: string;
}

// Define the props the component will accept
interface FormsPageProps {
    availableForms: FormTypeProp[];
    handleFormSelect: (formId: string) => void;
}

// Configuration for each form tab, including all necessary column names
const formTabs = [
  { id: 'CLABSI', name: 'CLABSI Incidences', table: 'clabsi_surveillance', date_col: 'surveillance_date', name_col: 'patient_name', id_col: 'hospital_id', status_col: 'review_status', creator_col: 'submitted_by'},
  { id: 'CLABSI_BUNDLE', name: 'CLABSI Bundle Entries', table: 'clabsi_bundle_entries', date_col: 'entry_date', name_col: 'patient_id', id_col: 'patient_id', status_col: 'compliance_score', creator_col: 'created_by' },
  { id: 'CAUTI', name: 'CAUTI Entries', table: 'cauti_surveillance', date_col: 'surveillance_date', name_col: 'patient_name', id_col: 'hospital_id', status_col: 'review_status', creator_col: 'submitted_by'},
  { id: 'MDRO', name: 'MDRO Entries', table: 'mdr_surveillance', date_col: 'report_submission_date', name_col: 'full_name', id_col: 'hospital_id', status_col: 'outcome', creator_col: 'created_by' },
];

export default function FormsPage({ availableForms, handleFormSelect }: FormsPageProps) {
  const [activeTab, setActiveTab] = useState('CLABSI');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // State to manage the entry viewer modal
  const [viewingEntry, setViewingEntry] = useState<{id: string, table: string} | null>(null);

  useEffect(() => {
    const fetchAllEntries = async () => {
      setLoading(true);
      setError(null);
      const currentTab = formTabs.find(t => t.id === activeTab);
      if (!currentTab) {
        setLoading(false);
        return;
      }

      const creatorColumn = currentTab.creator_col;
      if (!creatorColumn) {
          setError(`Configuration error: creator column not defined for tab ${activeTab}`);
          setLoading(false);
          return;
      }
      
      let selectQuery = `*, creator: ${creatorColumn} (full_name)`;

      try {
        const { data, error: fetchError } = await supabase.from(currentTab.table).select(selectQuery).order('created_at', { ascending: false });
        if (fetchError) throw fetchError;
        setEntries(data || []);
      } catch (err: any) {
        console.error(`Error fetching ${activeTab} entries:`, err);
        setError(err.message || `Failed to load ${activeTab} entries.`);
      } finally {
        setLoading(false);
      }
    };
    fetchAllEntries();
  }, [activeTab]);

  const currentTabInfo = formTabs.find(t => t.id === activeTab);
  const filteredEntries = entries.filter(entry =>
    (entry[currentTabInfo?.id_col || ''] || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry[currentTabInfo?.name_col || ''] || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.creator?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const csvHeaders = [
      { label: "Patient ID/Name", key: currentTabInfo?.name_col || '' },
      { label: "Hospital ID", key: currentTabInfo?.id_col || '' },
      { label: "Date", key: currentTabInfo?.date_col || '' },
      { label: "Status/Compliance", key: currentTabInfo?.status_col || '' },
      { label: "Submitted By", key: "creator.full_name" }
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Form Entries</h2>
                <p className="text-sm text-gray-500">View, search, and export all submitted surveillance forms.</p>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-4 py-2 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" /> Add New <ChevronDown className="w-4 h-4" /></button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-10">
                            <div className="p-2">{availableForms.map((form) => (<button key={form.id} onClick={() => { handleFormSelect(form.id); setDropdownOpen(false); }} className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-100 transition-colors"><div className={`${form.bgColor} p-2 rounded-full`}><form.icon className={`w-5 h-5 ${form.iconColor}`} /></div><div><p className="font-semibold text-gray-800">{form.name}</p><p className="text-sm text-gray-500">{form.description}</p></div></button>))}</div>
                        </div>
                    )}
                </div>
                <CSVLink data={filteredEntries} headers={csvHeaders} filename={`${activeTab}_entries.csv`} className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 border transition-colors"><Download className="w-4 h-4" /> Export CSV</CSVLink>
            </div>
        </div>
        
        <div className="border-b border-gray-200 px-4 sm:px-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {formTabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab.name}</button>
                ))}
            </nav>
        </div>
        
        <div>
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <label htmlFor="search-entries" className="sr-only">Search</label>
                <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-gray-400" /></div><input type="text" id="search-entries" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full max-w-md rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Search by Patient or Creator..."/></div>
            </div>
            <div className="overflow-x-auto">
                {loading ? <div className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-500">Loading entries...</p></div>
                : error ? <div className="text-center py-20 px-4"><AlertCircle className="mx-auto h-12 w-12 text-red-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Data</h3><p className="mt-1 text-sm text-gray-500">{error}</p></div>
                : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status / Compliance</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEntries.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-20 text-gray-500">No entries found.</td></tr>
                      ) : (
                        filteredEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div>{entry[currentTabInfo?.name_col || '']}</div>
                              <div className="text-xs text-gray-500">{entry[currentTabInfo?.id_col || '']}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry[currentTabInfo?.date_col || '']}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {currentTabInfo?.status_col === 'compliance_score' ? (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.compliance_score >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{entry.compliance_score}%</span>
                              ) : (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadgeColor(entry[currentTabInfo?.status_col || ''])}`}>{entry[currentTabInfo?.status_col || '']}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.creator?.full_name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => setViewingEntry({ id: entry.id, table: currentTabInfo!.table })}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-1" /> View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
            </div>
        </div>
      </div>

      <AnalysisModal
        isOpen={!!viewingEntry}
        onClose={() => setViewingEntry(null)}
        title="View Entry Details"
      >
        {viewingEntry && (
          <div className="printable-area">
            <EntryViewer 
              entryId={viewingEntry.id}
              tableName={viewingEntry.table}
            />
            <div className="mt-6 pt-6 border-t flex justify-end print:hidden">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Print Summary
              </button>
            </div>
          </div>
        )}
      </AnalysisModal>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}