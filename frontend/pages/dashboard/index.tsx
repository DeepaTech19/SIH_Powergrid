import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../lib/api';

type ApiDashboardStats = Awaited<ReturnType<typeof api.getDashboardStats>>;
type MaterialsSummary = Awaited<ReturnType<typeof api.getMaterialsSummary>>;
type DashboardStats = ApiDashboardStats & {
  totalProjects: number;
  lowStockItems: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await api.getDashboardStats();
      const projectsList = await api.getProjectsSummary();
      const materialsList: MaterialsSummary = await api.getMaterialsSummary();
      const lowStockCount = materialsList.filter(m => m.status === 'Low' || m.status === 'Critical').length;
      
      setStats({
        ...dashboardStats,
        totalProjects: projectsList.length,
        lowStockItems: lowStockCount,
      });
      setProjects(projectsList);
      setMaterials(materialsList);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (loading || !stats) {
    return (
      <DashboardLayout title="Dashboard Overview">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - POWERGRID</title>
      </Head>

      <DashboardLayout title="Dashboard Overview">
        <div className="fade-in">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="stat-card bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">Active Projects</p>
                  <p className="text-4xl font-bold mt-2">{stats.activeProjects}</p>
                  <p className="text-xs text-teal-100 mt-2">Out of {stats.totalProjects} total</p>
                </div>
                <svg className="w-16 h-16 text-teal-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            
            <div className="stat-card bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Materials</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{stats.totalMaterials}</p>
                  <p className="text-xs text-amber-600 mt-2 font-semibold">{stats.lowStockItems} Low Stock</p>
                </div>
                <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
            </div>
            
            <div className="stat-card bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Pending Orders</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{stats.pendingOrders}</p>
                  <p className="text-xs text-slate-500 mt-2">Procurement queue</p>
                </div>
                <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Forecast Accuracy</p>
                  <p className="text-4xl font-bold mt-2">{stats.forecastAccuracy}%</p>
                  <p className="text-xs text-blue-100 mt-2">AI Model Performance</p>
                </div>
                <svg className="w-16 h-16 text-blue-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button onClick={() => navigateTo('/dashboard/forecast')} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all text-left">
                <svg className="w-8 h-8 text-teal-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <p className="font-semibold text-slate-800">Generate Forecast</p>
                <p className="text-xs text-slate-500 mt-1">AI-powered predictions</p>
              </button>
              
              <button onClick={() => navigateTo('/dashboard/inventory')} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all text-left">
                <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                <p className="font-semibold text-slate-800">View Inventory</p>
                <p className="text-xs text-slate-500 mt-1">Stock management</p>
              </button>
              
              <button onClick={() => navigateTo('/dashboard/procurement')} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all text-left">
                <svg className="w-8 h-8 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <p className="font-semibold text-slate-800">New Order</p>
                <p className="text-xs text-slate-500 mt-1">Create procurement</p>
              </button>
              
              <button onClick={() => navigateTo('/dashboard/reports')} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all text-left">
                <svg className="w-8 h-8 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p className="font-semibold text-slate-800">View Reports</p>
                <p className="text-xs text-slate-500 mt-1">Analytics & exports</p>
              </button>
            </div>
          </div>
          
          {/* Recent Projects & Materials */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Active Projects</h3>
                <button onClick={() => navigateTo('/dashboard/projects')} className="text-teal-500 text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 4).map((p: any) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                      <span className="badge badge-info text-xs">{p.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>{p.location}</span>
                      <span>₹{(p.budget / 10000000).toFixed(2)} Cr</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${p.completion}%`}}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.completion}% Complete</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Inventory Alerts</h3>
                <button onClick={() => navigateTo('/dashboard/inventory')} className="text-teal-500 text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {materials.filter((m: any) => m.status !== 'Good').map((m: any) => (
                  <div key={m.id} className={`material-card p-3 bg-slate-50 rounded-lg border-l-4 ${m.status === 'Critical' ? 'border-red-500' : 'border-amber-500'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800 text-sm">{m.name}</p>
                      <span className={`badge ${m.status === 'Critical' ? 'badge-danger' : 'badge-warning'} text-xs`}>{m.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Stock: {m.currentStock} {m.unit}</span>
                      <span>Reorder: {m.reorderLevel}</span>
                    </div>
                  </div>
                ))}
                {materials.filter((m: any) => m.status === 'Good').slice(0, 2).map((m: any) => (
                  <div key={m.id} className="material-card p-3 bg-slate-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800 text-sm">{m.name}</p>
                      <span className="badge badge-success text-xs">{m.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Stock: {m.currentStock} {m.unit}</span>
                      <span>Reorder: {m.reorderLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
