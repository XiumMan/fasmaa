// src/components/analytics/BreakdownChart.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, AlertCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { DEPARTMENT_DISPLAY_NAMES, DepartmentType } from '@/types/database';

interface BreakdownChartProps {
  tableName: string;
  departmentCol: string;
  dateCol: string;
  title: string;
}

interface BreakdownData {
  department_name: string;
  cases: number;
}

export default function BreakdownChart({ tableName, departmentCol, dateCol, title }: BreakdownChartProps) {
  const [data, setData] = useState<BreakdownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);
  
  const [dateRange, setDateRange] = useState({
    start: lastYear.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchBreakdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: breakdownData, error: rpcError } = await supabase.rpc('get_department_breakdown', {
          start_date: dateRange.start,
          end_date: dateRange.end,
          table_name: tableName,
          department_column: departmentCol,
          date_column: dateCol,
        });

        if (rpcError) throw rpcError;
        
        // Use the display name for the department for better readability
        const formattedData = breakdownData.map((d: BreakdownData) => ({
            ...d,
            department_name: DEPARTMENT_DISPLAY_NAMES[d.department_name as DepartmentType] || d.department_name,
        }));
        setData(formattedData);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch breakdown data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdownData();
  }, [tableName, departmentCol, dateCol, dateRange]);

  const handleExport = () => {
    if (chartRef.current === null) return;
    toPng(chartRef.current, { cacheBust: true, backgroundColor: 'white' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${title.replace(/ /g, '_')}_${dateRange.start}_to_${dateRange.end}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Failed to export chart', err));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex gap-4 items-center">
            <div>
                <label className="block text-sm font-medium text-gray-600">Start Date</label>
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} className="border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600">End Date</label>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} className="border-gray-300 rounded-md shadow-sm"/>
            </div>
        </div>
        <button onClick={handleExport} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm">
          <Download className="w-4 h-4 mr-2" /> Export as PNG
        </button>
      </div>

      <div ref={chartRef} className="p-4 bg-white">
        {loading && <p className="text-center py-20">Loading Chart...</p>}
        {error && <div className="text-center py-20 text-red-600"><AlertCircle className="mx-auto h-8 w-8 mb-2" /><p>{error}</p></div>}
        {!loading && !error && (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="department_name" width={150} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="cases" fill="#3B82F6" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}