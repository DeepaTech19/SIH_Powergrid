import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const LOGOUT_REDIRECT_FLAG = 'powergrid-just-logged-out';

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/dashboard',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
    },
    { 
      id: 'forecast', 
      label: 'Demand Forecast', 
      path: '/dashboard/forecast',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      path: '/dashboard/inventory',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      path: '/dashboard/projects',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      path: '/dashboard/analytics',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },
    { 
      id: 'procurement', 
      label: 'Procurement', 
      path: '/dashboard/procurement',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      path: '/dashboard/reports',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      path: '/dashboard/settings',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
  ];

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(LOGOUT_REDIRECT_FLAG, 'true');
    }

    await logout();
    router.push('/');
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-800 text-slate-300 flex flex-col h-screen fixed top-0 left-0 transition-all duration-300 ease-in-out overflow-hidden`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center min-w-0">
          <svg className="h-8 w-8 flex-shrink-0 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75" />
          </svg>
          <span className={`ml-3 font-semibold text-xl text-white whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>POWERGRID</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.id}
            href={item.path}
            className={`nav-link flex items-center p-3 text-base font-medium rounded-lg transition-colors ${
              router.pathname === item.path ? 'active' : ''
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.label}</span>
          </Link>
        ))}
        
        <div className="border-t border-slate-700 my-2"></div>
        
        <button 
          onClick={handleLogout}
          className={`w-full text-left flex items-center p-3 text-base font-medium rounded-lg hover:bg-slate-700 text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
