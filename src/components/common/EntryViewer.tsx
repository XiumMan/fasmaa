// src/components/common/EntryViewer.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { DEPARTMENT_DISPLAY_NAMES, DepartmentType } from '@/types/database';

// A helper component to display a single field
const DetailField = ({ label, value }: { label: string, value: any }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-800">{String(value)}</p>
    </div>
  );
};

// A dedicated component to format and display CLABSI details
const ClabsiDetails = ({ data }: { data: any }) => (
  <div className="space-y-6">
    {/* Patient Section */}
    <div className="border-b pb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient & Procedure</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <DetailField label="Patient Name" value={data.patient_name} />
        <DetailField label="Hospital ID" value={data.hospital_id} />
        <DetailField label="Department" value={DEPARTMENT_DISPLAY_NAMES[data.department as DepartmentType] || data.department} />
        <DetailField label="Ward/Bed" value={data.ward_bed_number} />
        <DetailField label="Line Type" value={data.line_type} />
        <DetailField label="Insertion Site" value={data.insertion_site} />
      </div>
    </div>
    {/* Dates Section */}
    <div className="border-b pb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Dates</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <DetailField label="Line Insertion Date" value={new Date(data.line_insertion_date).toLocaleDateString()} />
        <DetailField label="Surveillance Date" value={new Date(data.surveillance_date).toLocaleDateString()} />
        <DetailField label="BSI Date" value={data.bloodstream_infection_date ? new Date(data.bloodstream_infection_date).toLocaleDateString() : 'N/A'} />
      </div>
    </div>
    {/* Findings Section */}
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Clinical & Lab Findings</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <DetailField label="Fever (>38°C)" value={data.symptoms?.fever ? 'Yes' : 'No'} />
        <DetailField label="Chills" value={data.symptoms?.chills ? 'Yes' : 'No'} />
        <DetailField label="Hypotension" value={data.symptoms?.hypotension ? 'Yes' : 'No'} />
        <DetailField label="Organism Identified" value={data.laboratory_findings?.organism_identified} />
        <DetailField label="Culture Source" value={data.laboratory_findings?.culture_source} />
        <DetailField label="Blood Culture Date" value={data.laboratory_findings?.blood_culture_date} />
      </div>
    </div>
  </div>
);

interface EntryViewerProps {
  entryId: string;
  tableName: string;
}

export default function EntryViewer({ entryId, tableName }: EntryViewerProps) {
  const [entry, setEntry] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId || !tableName) return;

    const fetchEntry = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', entryId)
          .single();

        if (error) throw error;
        setEntry(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch entry details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, tableName]);

  const renderDetails = () => {
    if (!entry) return null;
    
    // We can add more cases here for other forms like CAUTI, MDRO, etc.
    switch (tableName) {
      case 'clabsi_surveillance':
        return <ClabsiDetails data={entry} />;
      default:
        return <p>Viewer for this form type has not been implemented yet.</p>;
    }
  };

  if (loading) return <div className="text-center p-10">Loading details...</div>;
  if (error) return <div className="text-center p-10 text-red-600"><AlertCircle className="mx-auto h-6 w-6 mb-2" />Error: {error}</div>;

  return <div>{renderDetails()}</div>;
}