// src/components/analytics/TrendChart.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, AlertCircle } from 'lucide-react';
import { toPng } from 'html-to-image';

interface TrendChartProps {
  tableName: string;
  dateCol: string;
  title: string;
}

interface TrendData {
  month: string;
  cases: number;
}

export default function TrendChart({ tableName, dateCol, title }: TrendChartProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Set default date range to the last 12 months
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);
  
  const [dateRange, setDateRange] = useState({
    start: lastYear.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: trendData, error: rpcError } = await supabase.rpc('get_monthly_trends', {
          start_date: dateRange.start,
          end_date: dateRange.end,
          table_name: tableName,
          date_column: dateCol,
        });

        if (rpcError) throw rpcError;

        // Format the month for display
        const formattedData = trendData.map((d: TrendData) => ({
          ...d,
          month: new Date(d.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        }));
        setData(formattedData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trend data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [tableName, dateCol, dateRange]);

  const handleExport = () => {
    if (chartRef.current === null) {
      return;
    }
    toPng(chartRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to export chart', err);
      });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex gap-4 items-center">
            <div>
                <label className="block text-sm font-medium text-gray-600">Start Date</label>
                <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                    className="border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600">End Date</label>
                <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                    className="border-gray-300 rounded-md shadow-sm"
                />
            </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export as PNG
        </button>
      </div>

      <div ref={chartRef} className="p-4 bg-white">
        {loading && <p className="text-center py-20">Loading Chart...</p>}
        {error && <div className="text-center py-20 text-red-600"><AlertCircle className="mx-auto h-8 w-8 mb-2" /><p>{error}</p></div>}
        {!loading && !error && (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }} />
                  <Legend wrapperStyle={{ fontSize: '14px' }} />
                  <Line type="monotone" dataKey="cases" name={title} stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}