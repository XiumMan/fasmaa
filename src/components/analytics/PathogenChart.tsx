// src/components/analytics/PathogenChart.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, AlertCircle } from 'lucide-react';
import { toPng } from 'html-to-image';

interface PathogenChartProps {
  tableName: string;
  dateCol: string;
  title: string;
}

interface PathogenData {
  pathogen: string;
  cases: number;
}

// Predefined colors for a consistent look
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19D1FF', '#A4A4A4'];

export default function PathogenChart({ tableName, dateCol, title }: PathogenChartProps) {
  const [data, setData] = useState<PathogenData[]>([]);
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
    const fetchPathogenData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: pathogenData, error: rpcError } = await supabase.rpc('get_pathogen_breakdown', {
          start_date: dateRange.start,
          end_date: dateRange.end,
          table_name: tableName,
          date_column: dateCol,
        });

        if (rpcError) throw rpcError;
        setData(pathogenData || []);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch pathogen data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPathogenData();
  }, [tableName, dateCol, dateRange]);

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
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  // FIX: Provide a fallback of 0 for the percent value
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="cases"
                  nameKey="pathogen"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} cases`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}