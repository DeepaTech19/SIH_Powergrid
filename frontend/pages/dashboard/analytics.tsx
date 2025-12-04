import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../lib/api';

export default function Analytics() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [projectsData, materialsData, forecastsData, ordersData] = await Promise.all([
        api.getProjectsSummary(),
        api.getMaterialsSummary(),
        api.getForecasts(),
        api.getProcurementOrders()
      ]);
      
      setProjects(projectsData);
      setMaterials(materialsData);
      setForecasts(forecastsData);
      setOrders(ordersData);
      
      // Mock suppliers data
      setSuppliers([
        { id: 'SUP001', name: 'ABC Suppliers Ltd', category: 'Conductors', rating: 4.8, onTimeDelivery: 94, qualityScore: 96 },
        { id: 'SUP002', name: 'Power Components Inc', category: 'Towers', rating: 4.5, onTimeDelivery: 88, qualityScore: 92 },
        { id: 'SUP003', name: 'GridTech Solutions', category: 'Insulators', rating: 4.7, onTimeDelivery: 92, qualityScore: 95 },
        { id: 'SUP004', name: 'Transmission Equipment Co', category: 'Equipment', rating: 4.6, onTimeDelivery: 90, qualityScore: 93 }
      ]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Analytics Dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate metrics
  const inventoryHealth = ((materials.filter(m => m.status === 'Good').length / materials.length) * 100).toFixed(1);
  const criticalMaterials = materials.filter(m => m.status === 'Critical').length;
  const totalInventoryValue = materials.reduce((sum, m) => sum + (m.currentStock * m.costPerUnit), 0);
  
  const avgProjectCompletion = (projects.reduce((sum, p) => sum + p.completion, 0) / projects.length).toFixed(1);
  const atRiskProjects = projects.filter(p => p.completion < 50).length;
  const onTrackProjects = projects.filter(p => p.completion >= 50 && p.completion < 100).length;
  
  const forecastAccuracy = api.calculateForecastAccuracy();
  const accurateForecasts = forecasts.filter(f => f.actualQty && Math.abs((f.forecastedQty - f.actualQty) / f.forecastedQty * 100) < 10).length;
  
  const activeOrders = orders.filter(o => o.status === 'In Transit').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const avgDeliveryTime = deliveredOrders.length > 0 
    ? (deliveredOrders.reduce((sum, o) => sum + (o.deliveryDays || 30), 0) / deliveredOrders.length).toFixed(0)
    : '30';
  const onTimeDelivery = deliveredOrders.length > 0
    ? ((deliveredOrders.filter(o => (o.deliveryDays || 30) <= 30).length / deliveredOrders.length) * 100).toFixed(1)
    : '90';
  
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = orders.reduce((sum, o) => sum + o.totalValue, 0);
  const budgetUtilization = ((totalSpent / totalBudget) * 100).toFixed(1);
  
  const normalizePercentage = (value: number | string) => (typeof value === 'number' ? value : parseFloat(value));

  const overallHealth = Math.round(
    (
      normalizePercentage(inventoryHealth) +
      normalizePercentage(forecastAccuracy) +
      normalizePercentage(onTimeDelivery) +
      normalizePercentage(avgProjectCompletion)
    ) / 4
  );
  
  const urgentAlerts = materials.filter(m => m.status === 'Critical').length;
  
  const regionStats = Array.from(new Set(projects.map(p => p.region))).map(region => {
    const regionProjects = projects.filter(p => p.region === region);
    const avgCompletion = (regionProjects.reduce((sum, p) => sum + p.completion, 0) / regionProjects.length).toFixed(1);
    const atRisk = regionProjects.filter(p => p.completion < 50).length;
    return { region, projects: regionProjects.length, avgCompletion, atRisk };
  });

  const topMaterials = materials
    .map(m => ({ ...m, value: m.currentStock * m.costPerUnit }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <>
      <Head>
        <title>Analytics - POWERGRID</title>
      </Head>

      <DashboardLayout title="Analytics Dashboard">
        <div className="fade-in">
          {/* Overall Health Score */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-8 rounded-2xl shadow-lg text-white mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">🎯 Supply Chain Health Dashboard</h2>
                <p className="text-teal-100 text-sm">Real-time performance metrics across all operations</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6">
                <p className="text-sm text-teal-100 mb-1">Overall Health Score</p>
                <p className="text-5xl font-black">{overallHealth}%</p>
                <p className="text-xs text-teal-200 mt-2">Excellent Performance</p>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          {(urgentAlerts > 0 || atRiskProjects > 0) && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-red-500 text-white p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ Urgent Attention Required</h3>
                  <div className="space-y-2">
                    {criticalMaterials > 0 && <p className="text-red-800">• <strong>{criticalMaterials}</strong> material(s) at critical stock levels</p>}
                    {atRiskProjects > 0 && <p className="text-red-800">• <strong>{atRiskProjects}</strong> project(s) at risk due to material shortages</p>}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => router.push('/dashboard/inventory')} className="btn btn-primary text-sm">
                      View Inventory
                    </button>
                    <button onClick={() => router.push('/dashboard/procurement')} className="btn btn-outline text-sm">
                      Check Procurement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Pillars of Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Inventory Health */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-purple-200 p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <span className="text-2xl font-black text-purple-600">{inventoryHealth}%</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Inventory Health</h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate-600">Total Value: <span className="font-bold">₹{(totalInventoryValue / 10000000).toFixed(1)}Cr</span></p>
                <p className="text-slate-600">Critical Items: <span className="font-bold text-red-600">{criticalMaterials}</span></p>
                <p className="text-slate-600">Total Materials: <span className="font-bold">{materials.length}</span></p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${inventoryHealth}%` }}></div>
                </div>
              </div>
            </div>

            {/* Project Readiness */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-teal-200 p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span className="text-2xl font-black text-teal-600">{avgProjectCompletion}%</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Project Readiness</h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate-600">Total Projects: <span className="font-bold">{projects.length}</span></p>
                <p className="text-slate-600">At Risk: <span className="font-bold text-red-600">{atRiskProjects}</span></p>
                <p className="text-slate-600">On Track: <span className="font-bold text-green-600">{onTrackProjects}</span></p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${avgProjectCompletion}%` }}></div>
                </div>
              </div>
            </div>

            {/* Forecast Accuracy */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <span className="text-2xl font-black text-blue-600">{forecastAccuracy}%</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Forecast Accuracy</h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate-600">Total Forecasts: <span className="font-bold">{forecasts.length}</span></p>
                <p className="text-slate-600">Accurate: <span className="font-bold text-green-600">{accurateForecasts}</span></p>
                <p className="text-slate-600">AI Confidence: <span className="font-bold">High</span></p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${forecastAccuracy}%` }}></div>
                </div>
              </div>
            </div>

            {/* Procurement Efficiency */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-orange-200 p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <span className="text-2xl font-black text-orange-600">{onTimeDelivery}%</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Procurement Efficiency</h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate-600">Active Orders: <span className="font-bold">{activeOrders}</span></p>
                <p className="text-slate-600">Avg Delivery: <span className="font-bold">{avgDeliveryTime} days</span></p>
                <p className="text-slate-600">On-Time Rate: <span className="font-bold text-green-600">{onTimeDelivery}%</span></p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${onTimeDelivery}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost & Budget Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">💰 Cost & Budget Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-600 font-semibold mb-2">Total Budget</p>
                <p className="text-4xl font-black text-blue-700">₹{(totalBudget / 10000000).toFixed(1)}Cr</p>
                <p className="text-xs text-blue-500 mt-2">Allocated across {projects.length} projects</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-purple-600 font-semibold mb-2">Total Spent</p>
                <p className="text-4xl font-black text-purple-700">₹{(totalSpent / 10000000).toFixed(1)}Cr</p>
                <p className="text-xs text-purple-500 mt-2">Procurement to date</p>
              </div>
              <div className="text-center p-6 bg-teal-50 rounded-lg border-2 border-teal-200">
                <p className="text-sm text-teal-600 font-semibold mb-2">Budget Utilization</p>
                <p className="text-4xl font-black text-teal-700">{budgetUtilization}%</p>
                <div className="w-full bg-slate-200 rounded-full h-3 mt-3">
                  <div className="bg-teal-600 h-3 rounded-full" style={{ width: `${budgetUtilization}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Drill-Down Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Project Health by Region */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">📍 Project Health by Region</h3>
              <div className="space-y-3">
                {regionStats.map(region => (
                  <div key={region.region} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{region.region}</p>
                      <p className="text-xs text-slate-600">{region.projects} project(s) • {region.atRisk} at risk</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${parseFloat(region.avgCompletion) >= 70 ? 'text-green-600' : 'text-orange-600'}`}>{region.avgCompletion}%</p>
                      <div className="w-24 bg-slate-200 rounded-full h-2 mt-1">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${region.avgCompletion}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Materials by Value */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">💎 Top Materials by Inventory Value</h3>
              <div className="space-y-3">
                {topMaterials.map((m, idx) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 text-purple-700 font-black w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                        <p className="text-xs text-slate-600">{m.currentStock.toLocaleString()} {m.unit} in stock</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-purple-600">₹{(m.value / 100000).toFixed(1)}L</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        m.status === 'Good' ? 'bg-green-100 text-green-700' :
                        m.status === 'Low' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supplier Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">🏭 Supplier Performance Scorecard</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>On-Time Delivery</th>
                    <th>Quality Score</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(supplier => {
                    const overallScore = ((supplier.rating / 5 * 100) + supplier.onTimeDelivery + supplier.qualityScore) / 3;
                    return (
                      <tr key={supplier.id}>
                        <td className="font-bold text-slate-800">{supplier.name}</td>
                        <td>{supplier.category}</td>
                        <td>
                          <span className="text-yellow-500 font-bold">★ {supplier.rating}</span>
                          <span className="text-xs text-slate-500">/ 5.0</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${supplier.onTimeDelivery}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold">{supplier.onTimeDelivery}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${supplier.qualityScore}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold">{supplier.qualityScore}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            overallScore >= 90 ? 'badge-success' :
                            overallScore >= 75 ? 'badge-info' :
                            'badge-warning'
                          }`}>
                            {overallScore >= 90 ? 'Excellent' : overallScore >= 75 ? 'Good' : 'Fair'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
