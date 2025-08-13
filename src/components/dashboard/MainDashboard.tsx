// src/components/dashboard/MainDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Heart, AlertCircle, Users, Plus, Activity, ChevronDown, LogOut, User, Home, 
  ClipboardList, BarChart3, LucideIcon, FilePlus, Stethoscope
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import CountUp from 'react-countup';
import { useAuth } from "@/components/auth/AuthProvider";
import { useDashboardStats, useRecentSubmissions, useMonthlyTrends, formatRelativeTime, getStatusBadgeColor } from "@/hooks/useDashboard";

// Import all components rendered by the dashboard
import UserManagement from "@/components/admin/UserManagement";
import ProfileSection from "@/components/profile/ProfileSection";
import FormsPage from "@/components/forms/FormsPage";
import ClabsiForm from "@/components/forms/ClabsiForm";
import CautiForm from "@/components/forms/CautiForm";
import MdrForm from "@/components/forms/MdrForm";
import ClabsiBundleForm from "@/components/forms/ClabsiBundleForm";
import AnalyticsPage from "@/components/analytics/AnalyticsPage";
import SsiWatchlistPage from "@/components/ssi/SsiWatchlistPage";

// --- TYPE DEFINITIONS ---
interface FormTypeInfo { id: string; name: string; description: string; icon: LucideIcon; bgColor: string; iconColor: string; disabled?: boolean; }
interface SubmissionType { form_id: string; form_type: string; patient_name: string; ward_bed_number: string; review_status: string; created_at: string; }
interface StatsType { cautiCases: number; clabsiCases: number; mdroCases: number; thisMonth: number; }
interface TrendsData { 
    cauti: { month: string; cases: number }[], 
    clabsi: { month: string; cases: number }[],
    mdro: { month: string; cases: number }[]
}

// --- CONSTANTS ---
const formTypes: FormTypeInfo[] = [
  { id: "CLABSI", name: "CLABSI Form", description: "Report a CLABSI case", icon: AlertCircle, bgColor: "bg-red-100", iconColor: "text-red-600" },
  { id: "CLABSI_BUNDLE", name: "CLABSI Bundle Entry", description: "Daily compliance checklist", icon: Activity, bgColor: "bg-green-100", iconColor: "text-green-600" },
  { id: "CAUTI", name: "CAUTI Surveillance", description: "Catheter-Associated UTI", icon: Heart, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
  { id: "MDRO", name: "MDRO Surveillance", description: "Multi-Drug Resistant Organism", icon: FilePlus, bgColor: "bg-yellow-100", iconColor: "text-yellow-600" },
  { id: "SSI", name: "SSI Surveillance", description: "Surgical Site Infection", icon: Users, bgColor: "bg-purple-100", iconColor: "text-purple-600", disabled: true },
];

// --- MAIN COMPONENT ---
export default function MainDashboard() {
  // --- STATE MANAGEMENT ---
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [trendRange, setTrendRange] = useState(6); 

  // --- DATA HOOKS ---
  const { profile, userName, roleDisplayName, departmentDisplayName, canAccessForm, isAdmin, isIpcFocal, signOut } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { submissions, loading: submissionsLoading } = useRecentSubmissions(8);
  const { trends, loading: trendsLoading } = useMonthlyTrends(trendRange);

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { 
    const handleClickOutside = () => { if (sidebarOpen) setSidebarOpen(false); }; 
    if (sidebarOpen) document.addEventListener("click", handleClickOutside); 
    return () => document.removeEventListener("click", handleClickOutside); 
  }, [sidebarOpen]);

  // --- HANDLERS ---
  const handleFormSelect = (formType: string) => {
    switch(formType) {
        case 'CLABSI': setActiveSection('clabsi-form'); break;
        case 'CLABSI_BUNDLE': setActiveSection('clabsi-bundle-form'); break;
        case 'CAUTI': setActiveSection('cauti-form'); break;
        case 'MDRO': setActiveSection('mdr-form'); break;
        default: setActiveSection('forms');
    }
    setDropdownOpen(false);
  };
  
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };
  
  // --- DERIVED STATE ---
  const availableForms = formTypes.filter(form => !form.disabled && canAccessForm(form.id as any));
  
  const surgicalDepartments = ['GENERAL_SURGERY', 'OBSTETRICS_GYNECOLOGY', 'ORTHOPEDIC', 'CARDIAC_SURGERY', 'NEUROSURGERY'];
  const canSeeSsi = profile?.role === 'ADMIN' || (profile?.role === 'IPC_FOCAL' && surgicalDepartments.includes(profile?.department));
  
  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: Home, available: true },
    { id: "ssi-watchlist", name: "SSI Watchlist", icon: Stethoscope, available: canSeeSsi },
    { id: "forms", name: "Forms", icon: ClipboardList, available: true },
    { id: "analytics", name: "Analytics", icon: BarChart3, available: isIpcFocal || isAdmin },
    { id: "admin-users", name: "User Management", icon: Users, available: isAdmin },
  ].filter((item) => item.available);
  
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const getHeaderText = () => {
      switch(activeSection) {
          case "dashboard": return `Welcome back, ${userName.split(" ")[0]}! 👋`;
          case "ssi-watchlist": return "SSI Watchlist";
          case "forms": return "Forms & Data Entry";
          case "clabsi-form": return "CLABSI Incidence Form";
          case "clabsi-bundle-form": return "CLABSI Bundle Tracker";
          case "cauti-form": return "CAUTI Surveillance Form";
          case "mdr-form": return "MDR Case Reporting Form";
          case "analytics": return "Analytics & Reports";
          case "admin-users": return "User Management";
          case "profile": return "User Profile";
          default: return "Dashboard";
      }
  };
  
  const getSubHeaderText = () => {
    switch(activeSection) {
        case "dashboard": return `${departmentDisplayName} • Surveillance status`;
        case "ssi-watchlist": return "Track and manage suspected surgical site infections";
        case "forms": return "View and manage all surveillance form entries";
        case "clabsi-form": return "Central Line-Associated Bloodstream Infection surveillance";
        case "clabsi-bundle-form": return "Daily CLABSI prevention bundle compliance";
        case "cauti-form": return "Catheter-Associated UTI surveillance";
        case "mdr-form": return "Multi-Drug Resistant Organism surveillance";
        case "analytics": return "View infection control analytics and generate reports";
        case "admin-users": return "Manage user accounts and permissions";
        case "profile": return "Manage your account settings";
        default: return "";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* --- Mobile Header --- */}
      <header className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <button onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen);}} className="mr-3 p-1 rounded-md hover:bg-blue-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                <div><h1 className="text-lg font-bold">FASMAA</h1><p className="text-xs text-blue-100">Infection Control</p></div>
            </div>
            <div className="text-right"><p className="text-sm font-medium">{userName.split(" ")[0]}</p><p className="text-xs text-blue-100">{roleDisplayName}</p></div>
        </div>
      </header>
      {/* --- Mobile Sidebar --- */}
      {sidebarOpen && (<div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"><div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}><div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">FASMAA</h2><button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-blue-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="flex items-center space-x-3"><div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center"><User className="w-6 h-6 text-white" /></div><div><p className="font-medium">{userName}</p><p className="text-sm text-blue-100">{roleDisplayName}</p><p className="text-xs text-blue-200">{departmentDisplayName}</p></div></div></div><nav className="p-4 flex-1">{navigationItems.map((item) => (<button key={item.id} onClick={() => handleSectionChange(item.id)} className={`w-full flex items-center px-4 py-3 rounded-md text-left transition-colors mb-2 ${activeSection === item.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}><item.icon className="w-5 h-5 mr-3" /><span>{item.name}</span></button>))}</nav><div className="pt-4 px-4"><div className="border-t pt-4"><button onClick={() => handleSectionChange('profile')} className={`w-full flex items-center px-4 py-3 rounded-md text-left transition-colors mb-2 ${activeSection === 'profile' ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}><User className="w-5 h-5 mr-3" />My Profile</button><button onClick={signOut} className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-md"><LogOut className="w-5 h-5 mr-3" />Sign Out</button></div></div></div></div>)}
      {/* --- Desktop Sidebar --- */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:z-30">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white"><h2 className="text-2xl font-bold mb-1">FASMAA</h2><p className="text-blue-100 text-sm">Infection Prevention & Control</p><div className="mt-6 flex items-center space-x-3"><div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center"><User className="w-6 h-6 text-white" /></div><div><p className="font-medium">{userName}</p><p className="text-sm text-blue-100">{roleDisplayName}</p><p className="text-xs text-blue-200">{departmentDisplayName}</p></div></div></div>
        <nav className="flex-1 p-6 bg-white border-r overflow-y-auto flex flex-col">
          <div>{navigationItems.map((item) => (<button key={item.id} onClick={() => handleSectionChange(item.id)} className={`w-full flex items-center px-4 py-3 rounded-md text-left transition-colors mb-2 ${activeSection === item.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><item.icon className="w-5 h-5 mr-3" /><span className="font-medium">{item.name}</span></button>))}</div>
          <div className="mt-auto">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
            <button onClick={() => handleSectionChange('profile')} className={`w-full flex items-center px-4 py-3 rounded-md text-left transition-colors mb-2 ${activeSection === 'profile' ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}><User className="w-5 h-5 mr-3" />My Profile</button>
            <button onClick={signOut} className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-md"><LogOut className="w-5 h-5 mr-3" />Sign Out</button>
          </div>
        </nav>
      </div>
      {/* --- Main Content Area --- */}
      <div className="flex-1 lg:ml-80 flex flex-col min-h-screen">
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
            <div className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-900">{getHeaderText()}</h1>
                  <p className="text-gray-600 text-sm">{getSubHeaderText()}</p>
                </div>
                <div><p className="text-2xl font-bold text-gray-900 text-right">{formattedTime}</p><p className="text-gray-600 text-sm text-right">{formattedDate}</p></div>
            </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20 lg:pb-6">
          {activeSection === "dashboard" && <DashboardContent stats={stats} statsLoading={statsLoading} submissions={submissions} submissionsLoading={submissionsLoading} isIpcFocal={isIpcFocal} isAdmin={isAdmin} trends={trends} trendsLoading={trendsLoading} availableForms={availableForms} handleFormSelect={handleFormSelect} dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} trendRange={trendRange} setTrendRange={setTrendRange} />}
          {activeSection === "ssi-watchlist" && <SsiWatchlistPage />}
          {activeSection === "forms" && <FormsPage availableForms={availableForms} handleFormSelect={handleFormSelect} />}
          {activeSection === "clabsi-form" && <ClabsiForm handleSectionChange={handleSectionChange} />}
          {activeSection === "clabsi-bundle-form" && <ClabsiBundleForm />}
          {activeSection === "cauti-form" && <CautiForm />}
          {activeSection === "mdr-form" && <MdrForm handleSectionChange={handleSectionChange} />}
          {activeSection === "analytics" && <AnalyticsPage />}
          {activeSection === "admin-users" && isAdmin && <UserManagement />}
          {activeSection === "profile" && <ProfileSection />}
        </main>
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30"><div className="grid grid-cols-5 h-16">{navigationItems.map((item) => (<button key={item.id} onClick={() => handleSectionChange(item.id)} className={`flex flex-col items-center justify-center ${activeSection === item.id ? "text-blue-600 bg-blue-50": "text-gray-600"}`}><item.icon className="w-5 h-5 mb-1" /><span className="text-xs font-medium">{item.name}</span></button>))}</div></nav>
    </div>
  );
}

// --- Helper Components ---
function DashboardContent({ stats, statsLoading, submissions, submissionsLoading, isIpcFocal, isAdmin, trends, trendsLoading, availableForms, handleFormSelect, dropdownOpen, setDropdownOpen, trendRange, setTrendRange }: { stats: StatsType; statsLoading: boolean; submissions: SubmissionType[]; submissionsLoading: boolean; isIpcFocal: boolean; isAdmin: boolean; trends: TrendsData, trendsLoading: boolean, availableForms: FormTypeInfo[], handleFormSelect: (id: string) => void; dropdownOpen: boolean; setDropdownOpen: (isOpen: boolean) => void; trendRange: number; setTrendRange: (range: number) => void; }) {
  const trendRanges = [ { label: '3M', value: 3 }, { label: '6M', value: 6 }, { label: '1Y', value: 12 }];
  return (
    <div className="space-y-6">
      {(isIpcFocal || isAdmin) && (<div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50"><div className="flex items-start"><AlertCircle className="w-5 h-5 mt-0.5 mr-3 text-yellow-600"/><div><h4 className="text-sm font-medium text-yellow-800">IPC Alert</h4><p className="text-sm mt-1 text-yellow-700">{stats.thisMonth > 5 ? `${stats.thisMonth} new cases this month. Consider reviewing protocols.` : "Infection rates are within normal parameters."}</p></div></div></div>)}
      <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-4 py-2 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" /> Add New <ChevronDown className="w-4 h-4" /></button>
          {dropdownOpen && (<div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-10"><div className="p-2">{availableForms.map((form) => (<button key={form.id} onClick={() => handleFormSelect(form.id)} className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-100 transition-colors"><div className={`${form.bgColor} p-2 rounded-full`}><form.icon className={`w-5 h-5 ${form.iconColor}`} /></div><div><p className="font-semibold text-gray-800">{form.name}</p><p className="text-sm text-gray-500">{form.description}</p></div></button>))}</div></div>)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border"><h3 className="text-sm font-medium text-gray-700">CAUTI Cases</h3><p className="text-2xl font-bold text-gray-900 mt-1">{statsLoading ? "..." : <CountUp end={stats.cautiCases} duration={2.5} separator="," />}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md border"><h3 className="text-sm font-medium text-gray-700">CLABSI Cases</h3><p className="text-2xl font-bold text-gray-900 mt-1">{statsLoading ? "..." : <CountUp end={stats.clabsiCases} duration={2.5} separator="," />}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md border"><h3 className="text-sm font-medium text-gray-700">MDRO Cases</h3><p className="text-2xl font-bold text-gray-900 mt-1">{statsLoading ? "..." : <CountUp end={stats.mdroCases} duration={2.5} separator="," />}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md border"><h3 className="text-sm font-medium text-gray-700">New This Month</h3><p className="text-2xl font-bold text-gray-900 mt-1">{statsLoading ? "..." : <CountUp end={stats.thisMonth} duration={2.5} separator="," />}</p></div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border">
        <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-medium text-gray-900">Monthly Infection Trends</h3><div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">{trendRanges.map(range => (<button key={range.value} onClick={() => setTrendRange(range.value)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${trendRange === range.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>{range.label}</button>))}</div></div>
        <div className="p-4"><TrendsChart data={trends} loading={trendsLoading} /></div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border">
        <div className="p-4 border-b"><h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3></div>
        <div className="max-h-96 overflow-y-auto"><div className="divide-y divide-gray-200">{submissionsLoading ? <div className="p-8 text-center"><p className="text-gray-500">Loading...</p></div> : submissions.length === 0 ? <div className="p-8 text-center text-gray-500"><p>No recent submissions.</p></div> : submissions.map((sub, i) => (<div key={i} className="p-4 hover:bg-gray-50 flex items-center justify-between"><div className="flex items-center space-x-3"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${sub.form_type === "CAUTI" ? "bg-blue-100 text-blue-800" : sub.form_type === "CLABSI" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{sub.form_type}</span><div><p className="text-sm font-medium text-gray-900">{sub.patient_name}</p><p className="text-sm text-gray-500">{sub.ward_bed_number}</p></div></div><div className="flex items-center space-x-3"><span className={`text-xs capitalize px-2 py-1 rounded-full ${getStatusBadgeColor(sub.review_status)}`}>{sub.review_status}</span><span className="text-sm text-gray-500">{formatRelativeTime(sub.created_at)}</span></div></div>))}</div></div>
      </div>
    </div>
  )
}

const TrendsChart = React.memo(function TrendsChart({ data, loading }: { data: TrendsData, loading: boolean }) {
  if (loading) return <div className="h-72 flex items-center justify-center text-gray-500">Loading trend data...</div>;
  
  const hasAllData = data && data.cauti && data.clabsi && data.mdro;
  if (!hasAllData) return <div className="h-72 flex items-center justify-center text-gray-500">Waiting for data...</div>;

  const chartData = data.cauti.map((cautiItem, index) => ({
      month: cautiItem.month,
      CAUTI: cautiItem.cases,
      CLABSI: data.clabsi[index]?.cases || 0,
      MDRO: data.mdro[index]?.cases || 0,
      SSI: 0, 
  }));

  const hasData = chartData.some(d => d.CLABSI > 0 || d.CAUTI > 0 || d.MDRO > 0);
  if (!hasData) return <div className="h-72 flex items-center justify-center text-gray-500">No infection data reported for this period.</div>
  
  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line isAnimationActive={!loading} type="monotone" dataKey="CLABSI" name="CLABSI" stroke="#EF4444" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line isAnimationActive={!loading} type="monotone" dataKey="CAUTI" name="CAUTI" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line isAnimationActive={!loading} type="monotone" dataKey="MDRO" name="MDRO" stroke="#F59E0B" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line isAnimationActive={!loading} type="monotone" dataKey="SSI" name="SSI" stroke="#8B5CF6" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
});
TrendsChart.displayName = 'TrendsChart';