// src/components/analytics/AnalyticsPage.tsx
'use client'

import { useState } from 'react';
import { BarChart3, AlertCircle, ShieldCheck, Heart, Activity, LineChart, Hospital, TestTube2, PieChart } from 'lucide-react';
import AnalysisTab, { AnalysisTabConfig } from './AnalysisTab';

// FIX: Added a 'creatorCol' to each configuration to make the user join explicit.
const analyticsTabs: AnalysisTabConfig[] = [
  { 
    id: 'CLABSI', 
    name: 'CLABSI Incidence', 
    table: 'clabsi_surveillance',
    dateCol: 'surveillance_date',
    patientCol: 'patient_name',
    departmentCol: 'department',
    creatorCol: 'submitted_by', // <-- Added
    analyses: [
      { id: 'trends', name: 'Infection Trends', icon: LineChart },
      { id: 'dept', name: 'Department Breakdown', icon: Hospital },
      { id: 'pathogen', name: 'Common Pathogens', icon: TestTube2 },
    ]
  },
  { 
    id: 'CLABSI_BUNDLE', 
    name: 'CLABSI Bundle', 
    table: 'clabsi_bundle_entries',
    dateCol: 'entry_date',
    patientCol: 'patient_id',
    departmentCol: 'department',
    creatorCol: 'created_by', // <-- Added
     analyses: [
      { id: 'compliance_trend', name: 'Overall Compliance Trend', icon: LineChart },
      { id: 'component_breakdown', name: 'Compliance by Component', icon: BarChart3 },
    ]
  },
  { 
    id: 'CAUTI', 
    name: 'CAUTI', 
    table: 'cauti_surveillance',
    dateCol: 'surveillance_date',
    patientCol: 'patient_name',
    departmentCol: 'department',
    creatorCol: 'submitted_by', // <-- Added
     analyses: [
      { id: 'trends', name: 'Infection Trends', icon: LineChart },
      { id: 'dept', name: 'Department Breakdown', icon: Hospital },
    ]
  },
  { 
    id: 'MDRO', 
    name: 'MDRO', 
    table: 'mdr_surveillance',
    dateCol: 'report_submission_date',
    patientCol: 'full_name',
    departmentCol: 'ward_unit',
    creatorCol: 'created_by', // <-- Added
     analyses: [
      { id: 'organism_dist', name: 'Organism Distribution', icon: PieChart },
      { id: 'site_dist', name: 'Infection Site Breakdown', icon: BarChart3 },
    ]
  },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('CLABSI');

  const currentTabConfig = analyticsTabs.find(t => t.id === activeTab);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
          Infection Control Analytics
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Analyze surveillance data, visualize trends, and export reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto px-6" aria-label="Tabs">
          {analyticsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div>
        {currentTabConfig ? (
          <AnalysisTab config={currentTabConfig} />
        ) : (
          <div className="p-6 text-center text-gray-500">Please select a tab to view analytics.</div>
        )}
      </div>
    </div>
  );
}