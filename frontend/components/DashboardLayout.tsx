import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import Sidebar from './Sidebar';

const LOGOUT_REDIRECT_FLAG = 'powergrid-just-logged-out';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

interface LayoutHeaderProps {
  title: string;
  onToggleSidebar?: () => void;
}

function LayoutHeader({ title, onToggleSidebar }: LayoutHeaderProps) {
  const [lastUpdated] = useState(new Date().toLocaleString());

  return (
    <header className="flex justify-between items-center px-6 h-16 bg-white border-b border-slate-200">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="text-slate-600 hover:text-slate-800 transition-colors p-1"
            title="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-sm text-slate-500 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
          </svg>
          <span id="last-updated">{lastUpdated}</span>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from sessionStorage to persist state across navigation
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('sidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });

  // Persist sidebar state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (loading || user || typeof window === 'undefined') {
      return;
    }

    const shouldGoHome = sessionStorage.getItem(LOGOUT_REDIRECT_FLAG) === 'true';
    if (shouldGoHome) {
      sessionStorage.removeItem(LOGOUT_REDIRECT_FLAG);
      router.replace('/');
      return;
    }

    router.replace('/auth/signin');
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <div className="print:hidden">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      <div 
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out print:!ml-0 print:!w-full print:!h-auto print:!overflow-visible" 
        style={{ marginLeft: sidebarCollapsed ? '5rem' : '16rem' }}
      >
        <div className="print:hidden transition-all duration-300 ease-in-out">
          <LayoutHeader title={title} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-8 print:p-0 print:bg-white transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
}
