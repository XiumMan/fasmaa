// src/components/auth/DemoLogin.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  User,
  AlertCircle,
  Play
} from 'lucide-react'

// Demo users for testing without Supabase auth
const DEMO_USERS = [
  {
    id: 'demo-admin-1',
    email: 'admin@hmh.demo',
    password: 'demo123',
    profile: {
      id: 'demo-admin-1',
      user_id: 'demo-admin-1',
      email: 'admin@hmh.demo',
      full_name: 'Demo Administrator',
      employee_id: 'DEMO001',
      role: 'ADMIN',
      department: 'IPC_COMMITTEE',
      is_active: true,
      phone: '+960-123-4567',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'demo-ipc-1',
    email: 'ipc@hmh.demo',
    password: 'demo123',
    profile: {
      id: 'demo-ipc-1',
      user_id: 'demo-ipc-1',
      email: 'ipc@hmh.demo',
      full_name: 'IPC Focal Person',
      employee_id: 'IPC001',
      role: 'IPC_FOCAL',
      department: 'IPC_COMMITTEE',
      is_active: true,
      phone: '+960-123-4568',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'demo-nurse-1',
    email: 'nurse@hmh.demo',
    password: 'demo123',
    profile: {
      id: 'demo-nurse-1',
      user_id: 'demo-nurse-1',
      email: 'nurse@hmh.demo',
      full_name: 'ICU Head Nurse',
      employee_id: 'ICU001',
      role: 'CHARGE_NURSE',
      department: 'ICU',
      is_active: true,
      phone: '+960-123-4569',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
];

interface DemoLoginProps {
  onDemoLogin: (user: any, profile: any) => void;
}

export default function DemoLogin({ onDemoLogin }: DemoLoginProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDemoLogin = async (demoUser: typeof DEMO_USERS[0]) => {
    setLoading(true);

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock user object
      const mockUser = {
        id: demoUser.id,
        email: demoUser.email,
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store demo session in localStorage
      localStorage.setItem('demo_session', JSON.stringify({
        user: mockUser,
        profile: demoUser.profile,
        isDemo: true
      }));

      // Call the demo login handler
      onDemoLogin(mockUser, demoUser.profile);

      // Redirect to dashboard
      router.push('/');

    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border-2 border-dashed border-amber-200 rounded-lg bg-amber-50">
      <div className="flex items-center mb-3">
        <Play className="w-5 h-5 text-amber-600 mr-2" />
        <h3 className="text-lg font-semibold text-amber-800">Demo Mode</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-700 mb-2">
              Email authentication is disabled. Use demo mode to explore the platform:
            </p>
            <ul className="text-xs text-amber-600 space-y-1">
              <li>• Full access to all features</li>
              <li>• Test data and forms</li>
              <li>• No email confirmation required</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {DEMO_USERS.map((demoUser) => (
          <button
            key={demoUser.id}
            onClick={() => handleDemoLogin(demoUser)}
            disabled={loading}
            className="w-full flex items-center justify-between p-3 text-left border border-amber-200 rounded-md hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">{demoUser.profile.full_name}</p>
                <p className="text-sm text-amber-600">{demoUser.profile.role} • {demoUser.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-amber-600">Click to login</p>
            </div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600 mr-2"></div>
          <span className="text-sm text-amber-700">Starting demo session...</span>
        </div>
      )}
    </div>
  );
}