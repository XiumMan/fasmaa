// src/components/analytics/AnalysisTab.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { DEPARTMENT_DISPLAY_NAMES, DepartmentType } from '@/types/database';
import AnalysisModal from './AnalysisModal';
import TrendChart from './TrendChart';
import BreakdownChart from './BreakdownChart';
import PathogenChart from './PathogenChart'; // Import the new pathogen chart

export interface AnalysisTabConfig {
  id: string;
  name: string;
  table: string;
  dateCol: string;
  patientCol: string;
  departmentCol: string;
  creatorCol: string;
  analyses: {
    id: string;
    name: string;
    icon: React.ElementType;
  }[];
}

interface AnalysisTabProps {
  config: AnalysisTabConfig;
}

export default function AnalysisTab({ config }: AnalysisTabProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = `id, created_at, ${config.dateCol}, ${config.patientCol}, ${config.departmentCol}, creator: ${config.creatorCol} ( full_name )`;
        const { data, error: fetchError } = await supabase.from(config.table).select(query).order('created_at', { ascending: false });
        if (fetchError) throw fetchError;
        setEntries(data || []);
      } catch (err: any) {
        console.error(`Error fetching ${config.name} entries:`, err);
        setError(err.message || `Failed to load entries.`);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [config]);

  const handleAnalysisClick = (analysis: {id: string, name: string}) => {
    setActiveAnalysis(analysis);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveAnalysis(null);
  };

  return (
    <>
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-4 border mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Analyses for {config.name}</h3>
          <div className="flex flex-wrap gap-3">
            {config.analyses.map(analysis => (
              <button
                key={analysis.id}
                onClick={() => handleAnalysisClick(analysis)}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-md border shadow-sm hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                <analysis.icon className="w-4 h-4 mr-2 text-blue-600" />
                {analysis.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table rendering code remains the same */}
        {loading && <p className="text-center py-10">Loading entries...</p>}
        {error && <div className="text-center py-10 text-red-600"><AlertCircle className="mx-auto h-8 w-8 mb-2" /><p>Error loading data: {error}</p></div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-500">No entries found.</td></tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry[config.patientCol]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{DEPARTMENT_DISPLAY_NAMES[entry[config.departmentCol] as DepartmentType] || entry[config.departmentCol]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry[config.dateCol]).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.creator?.full_name || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnalysisModal isOpen={isModalOpen} onClose={closeModal} title={activeAnalysis?.name || 'Analysis'}>
        {activeAnalysis?.id === 'trends' && (
          <TrendChart 
            tableName={config.table}
            dateCol={config.dateCol}
            title={activeAnalysis.name}
          />
        )}
        
        {activeAnalysis?.id === 'dept' && (
          <BreakdownChart
            tableName={config.table}
            departmentCol={config.departmentCol}
            dateCol={config.dateCol}
            title={activeAnalysis.name}
          />
        )}
        
        {/* FIX: Render the new PathogenChart component */}
        {activeAnalysis?.id === 'pathogen' && (
          <PathogenChart
            tableName={config.table}
            dateCol={config.dateCol}
            title={activeAnalysis.name}
          />
        )}
      </AnalysisModal>
    </>
  );
}