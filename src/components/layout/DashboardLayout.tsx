'use client';

import { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  BarChart3, 
  BookOpen, 
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import UserProfile from '../auth/UserProfile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', icon: Home, active: true },
  { name: 'Forms', icon: FileText, active: false },
  { name: 'Analytics', icon: BarChart3, active: false },
  { name: 'SOPs', icon: BookOpen, active: false },
  { name: 'Settings', icon: Settings, active: false },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex-1 text-center">
          <h1 className="text-white font-bold text-lg">FASMAA</h1>
          <p className="text-white/80 text-xs">Hulhumale Hospital</p>
        </div>

        {/* Mobile User Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">FASMAA</h1>
            <p className="text-white/80 text-sm">Infection Prevention & Control Platform</p>
          </div>
          
          {/* Desktop User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-medium">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-white/80 text-sm">{user?.user_metadata?.role || 'Staff'}</p>
            </div>
            
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
            </button>
            
            <button 
              onClick={handleSignOut}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-white">FASMAA Menu</h2>
                <p className="text-sm text-white/80">Hulhumale Hospital</p>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="p-4">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium mb-2 transition-colors ${
                      item.active
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Account
                </h3>
                
                <button
                  onClick={() => {
                    setProfileOpen(true);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium mb-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <User className="w-5 h-5 mr-3" />
                  My Profile
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen sticky top-[72px]">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">IPC Menu</h2>
          </div>
          
          <nav className="p-4">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              {navigation.map((item) => (
                <button
                  key={item.name}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
                    item.active
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              ))}
            </div>

            {/* Desktop User Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account
              </h3>
              
              <button
                onClick={() => setProfileOpen(true)}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium mb-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <User className="w-5 h-5 mr-3" />
                My Profile
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:min-h-screen">
          <div className="pb-16 lg:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 h-16">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`flex flex-col items-center justify-center transition-colors ${
                item.active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />
    </div>
  );
}