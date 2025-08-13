// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardStats, RecentSubmission, ReviewStatus, FormType, DepartmentType } from '@/types/database'

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({ cautiCases: 0, clabsiCases: 0, ssiCases: 0, mdroCases: 0, thisMonth: 0, totalPatients: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        
        const { count: cautiCount } = await supabase.from('cauti_surveillance').select('*', { count: 'exact', head: true });
        const { count: clabsiCount } = await supabase.from('clabsi_surveillance').select('*', { count: 'exact', head: true });
        const { count: mdroCount } = await supabase.from('mdr_surveillance').select('*', { count: 'exact', head: true });
        
        const { count: cautiThisMonth } = await supabase.from('cauti_surveillance').select('*', { count: 'exact', head: true }).gte('surveillance_date', startOfMonth);
        const { count: clabsiThisMonth } = await supabase.from('clabsi_surveillance').select('*', { count: 'exact', head: true }).gte('surveillance_date', startOfMonth);
        const { count: mdroThisMonth } = await supabase.from('mdr_surveillance').select('*', { count: 'exact', head: true }).gte('report_submission_date', startOfMonth);

        setStats({
          cautiCases: cautiCount || 0,
          clabsiCases: clabsiCount || 0,
          ssiCases: 0,
          mdroCases: mdroCount || 0,
          thisMonth: (cautiThisMonth || 0) + (clabsiThisMonth || 0) + (mdroThisMonth || 0),
          totalPatients: (cautiCount || 0) + (clabsiCount || 0) + (mdroCount || 0)
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  return { stats, loading };
};

export const useRecentSubmissions = (limit: number = 10) => {
  const [submissions, setSubmissions] = useState<RecentSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentSubmissions = async () => {
      try {
        setLoading(true)
        
        const { data: cautiData, error: cautiError } = await supabase.from('cauti_surveillance').select('*, creator:user_profiles!submitted_by(full_name)').order('created_at', { ascending: false }).limit(limit)
        if(cautiError) throw cautiError;

        const { data: clabsiData, error: clabsiError } = await supabase.from('clabsi_surveillance').select('*, creator:user_profiles!submitted_by(full_name)').order('created_at', { ascending: false }).limit(limit)
        if(clabsiError) throw clabsiError;

        const allSubmissions: RecentSubmission[] = [];

        (cautiData as any[])?.forEach(item => { allSubmissions.push({ form_id: item.form_number || item.id.slice(0, 8).toUpperCase(), form_type: FormType.CAUTI, patient_name: item.patient_name, department: item.department, ward_bed_number: item.ward_bed_number, submission_date: item.surveillance_date, review_status: item.review_status, submitted_by: item.creator?.full_name || 'Unknown User', created_at: item.created_at }) });
        
        (clabsiData as any[])?.forEach(item => { allSubmissions.push({ form_id: item.form_number || item.id.slice(0, 8).toUpperCase(), form_type: FormType.CLABSI, patient_name: item.patient_name, department: item.department, ward_bed_number: item.ward_bed_number, submission_date: item.surveillance_date, review_status: item.review_status, submitted_by: item.creator?.full_name || 'Unknown User', created_at: item.created_at }) });

        allSubmissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
        setSubmissions(allSubmissions.slice(0, limit))
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to load recent submissions')
      } finally {
        setLoading(false)
      }
    }
    fetchRecentSubmissions()
  }, [limit])
  return { submissions, loading, error }
}

// FIX: This hook is updated to fetch and process MDR trend data.
export const useMonthlyTrends = (months: number) => {
  // 1. Add 'mdro' to the state structure
  const [trends, setTrends] = useState<{
      cauti: Array<{ month: string, cases: number }>, 
      clabsi: Array<{ month: string, cases: number }>,
      mdro: Array<{ month: string, cases: number }>
  }>({ cauti: [], clabsi: [], mdro: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - months);
        const startDateString = startDate.toISOString().split('T')[0];
        const endDateString = endDate.toISOString().split('T')[0];

        // 2. Fetch data from all three surveillance tables
        const { data: cautiData } = await supabase.from('cauti_surveillance').select('surveillance_date').gte('surveillance_date', startDateString).lte('surveillance_date', endDateString);
        const { data: clabsiData } = await supabase.from('clabsi_surveillance').select('surveillance_date').gte('surveillance_date', startDateString).lte('surveillance_date', endDateString);
        const { data: mdroData } = await supabase.from('mdr_surveillance').select('report_submission_date').gte('report_submission_date', startDateString).lte('report_submission_date', endDateString);

        const processMonthlyData = (data: Array<{ [key: string]: string }> | null, dateKey: string) => {
          const monthlyCount: { [key: string]: number } = {};
          (data || []).forEach(item => {
            const dateStr = item[dateKey];
            if (!dateStr) return;
            const monthKey = dateStr.substring(0, 7);
            monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
          });

          const result = [];
          for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            result.push({ month: monthName, cases: monthlyCount[monthKey] || 0 });
          }
          return result;
        };

        // 3. Set the state for all three data types
        setTrends({
          cauti: processMonthlyData(cautiData, 'surveillance_date'),
          clabsi: processMonthlyData(clabsiData, 'surveillance_date'),
          mdro: processMonthlyData(mdroData, 'report_submission_date')
        });
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load trend data');
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [months]);

  return { trends, loading, error };
};

// --- Utility Functions ---
export const formatRelativeTime = (date: string): string => {
  const now = new Date(); const targetDate = new Date(date);
  const diffInHours = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'approved':
    case 'Recovered':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'Ongoing Treatment':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
    case 'Expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};