import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../lib/api';

export default function Reports() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const [projectsData, materialsData, ordersData, forecastsData] = await Promise.all([
        api.getProjectsSummary(),
        api.getMaterialsSummary(),
        api.getProcurementOrders(),
        api.getForecasts()
      ]);
      
      setProjects(projectsData);
      setMaterials(materialsData);
      setOrders(ordersData);
      setForecasts(forecastsData);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (reportType: string) => {
    const filteredProjects = selectedProject === 'all' 
      ? projects 
      : projects.filter(p => p.id === selectedProject);

    let reportData: any = {
      type: reportType,
      project: selectedProject === 'all' ? 'All Projects' : filteredProjects[0]?.name || 'Unknown',
      generatedAt: new Date().toLocaleString(),
      metrics: {},
      details: []
    };

    switch (reportType) {
      case 'inventory':
        const filteredMaterials = selectedProject === 'all' 
          ? materials 
          : materials.filter(m => filteredProjects.some(p => p.materials?.includes(m.id)));
        
        reportData.metrics = {
          totalMaterials: filteredMaterials.length,
          criticalStock: filteredMaterials.filter(m => m.status === 'Critical').length,
          lowStock: filteredMaterials.filter(m => m.status === 'Low').length,
          totalValue: filteredMaterials.reduce((sum, m) => sum + (m.currentStock * m.costPerUnit), 0)
        };
        reportData.details = filteredMaterials.map(m => ({
          name: m.name,
          category: m.category,
          currentStock: m.currentStock,
          requiredQty: m.requiredQty,
          status: m.status,
          value: m.currentStock * m.costPerUnit
        }));
        break;

      case 'financial':
        const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
        const totalSpent = orders
          .filter(o => selectedProject === 'all' || o.projectId === selectedProject)
          .reduce((sum, o) => sum + o.totalValue, 0);
        
        reportData.metrics = {
          totalBudget,
          totalSpent,
          budgetUtilization: ((totalSpent / totalBudget) * 100).toFixed(1),
          activeProjects: filteredProjects.length
        };
        reportData.details = filteredProjects.map(p => ({
          project: p.name,
          budget: p.budget,
          spent: orders.filter(o => o.projectId === p.id).reduce((sum, o) => sum + o.totalValue, 0),
          completion: p.completion
        }));
        break;

      case 'forecast':
        const relevantForecasts = selectedProject === 'all'
          ? forecasts
          : forecasts.filter(f => f.projectId === selectedProject);
        
        const accurateForecasts = relevantForecasts.filter(f => 
          f.actualQty && Math.abs((f.forecastedQty - f.actualQty) / f.forecastedQty * 100) < 10
        );
        
        reportData.metrics = {
          totalForecasts: relevantForecasts.length,
          accurateForecasts: accurateForecasts.length,
          accuracy: ((accurateForecasts.length / relevantForecasts.length) * 100).toFixed(1),
          avgVariance: '8.5%'
        };
        reportData.details = relevantForecasts.map(f => ({
          material: f.materialName,
          forecasted: f.forecastedQty,
          actual: f.actualQty || 'Pending',
          variance: f.actualQty ? `${Math.abs(((f.forecastedQty - f.actualQty) / f.forecastedQty) * 100).toFixed(1)}%` : 'N/A'
        }));
        break;

      case 'procurement':
        const relevantOrders = selectedProject === 'all'
          ? orders
          : orders.filter(o => o.projectId === selectedProject);
        
        const deliveredOrders = relevantOrders.filter(o => o.status === 'Delivered');
        const onTimeDeliveries = deliveredOrders.filter(o => (o.deliveryDays || 30) <= 30).length;
        
        reportData.metrics = {
          totalOrders: relevantOrders.length,
          activeOrders: relevantOrders.filter(o => o.status === 'In Transit').length,
          totalValue: relevantOrders.reduce((sum, o) => sum + o.totalValue, 0),
          onTimeRate: deliveredOrders.length > 0 ? `${((onTimeDeliveries / deliveredOrders.length) * 100).toFixed(1)}%` : 'N/A'
        };
        reportData.details = relevantOrders.map(o => ({
          orderId: o.id,
          material: o.materialName,
          supplier: o.supplier,
          value: o.totalValue,
          status: o.status
        }));
        break;

      case 'supplier':
        const suppliers = Array.from(new Set(orders.map(o => o.supplier))).map(supplier => {
          const supplierOrders = orders.filter(o => o.supplier === supplier);
          const delivered = supplierOrders.filter(o => o.status === 'Delivered');
          const onTime = delivered.filter(o => (o.deliveryDays || 30) <= 30);
          
          return {
            name: supplier,
            totalOrders: supplierOrders.length,
            totalValue: supplierOrders.reduce((sum, o) => sum + o.totalValue, 0),
            onTimeDelivery: delivered.length > 0 ? `${((onTime.length / delivered.length) * 100).toFixed(1)}%` : 'N/A',
            avgLeadTime: delivered.length > 0 
              ? `${Math.round(delivered.reduce((sum, o) => sum + (o.deliveryDays || 30), 0) / delivered.length)} days`
              : 'N/A'
          };
        });
        
        reportData.metrics = {
          totalSuppliers: suppliers.length,
          totalOrders: orders.length,
          totalValue: orders.reduce((sum, o) => sum + o.totalValue, 0),
          avgSupplierRating: '4.6'
        };
        reportData.details = suppliers;
        break;

      case 'project':
        reportData.metrics = {
          totalProjects: filteredProjects.length,
          avgCompletion: (filteredProjects.reduce((sum, p) => sum + p.completion, 0) / filteredProjects.length).toFixed(1) + '%',
          atRisk: filteredProjects.filter(p => p.completion < 50).length,
          totalBudget: filteredProjects.reduce((sum, p) => sum + p.budget, 0)
        };
        reportData.details = filteredProjects.map(p => ({
          name: p.name,
          region: p.region,
          completion: p.completion + '%',
          budget: p.budget,
          status: p.completion >= 80 ? 'On Track' : p.completion >= 50 ? 'In Progress' : 'At Risk'
        }));
        break;
    }

    setGeneratedReport(reportData);
    // Scroll to report after a short delay to ensure rendering
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const printReport = () => {
    window.print();
  };

  const downloadReport = () => {
    alert('PDF download functionality would be implemented here using jsPDF library');
  };

  if (loading) {
    return (
      <DashboardLayout title="Reports">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const reportTypes = [
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Stock levels, material analysis, and inventory health metrics',
      icon: '📦',
      color: 'teal'
    },
    {
      id: 'financial',
      name: 'Financial Summary',
      description: 'Budget tracking, cost analysis, and financial performance',
      icon: '💰',
      color: 'blue'
    },
    {
      id: 'forecast',
      name: 'Forecast Performance',
      description: 'AI prediction accuracy and demand forecasting analysis',
      icon: '🎯',
      color: 'purple'
    },
    {
      id: 'procurement',
      name: 'Procurement Performance',
      description: 'Purchase orders, delivery metrics, and supplier timeline',
      icon: '🛒',
      color: 'orange'
    },
    {
      id: 'supplier',
      name: 'Supplier Analysis',
      description: 'Supplier performance, ratings, and delivery statistics',
      icon: '🏭',
      color: 'indigo'
    },
    {
      id: 'project',
      name: 'Project Performance',
      description: 'Project completion, timelines, and milestone tracking',
      icon: '📊',
      color: 'cyan'
    }
  ];

  return (
    <>
      <Head>
        <title>Reports - POWERGRID</title>
      </Head>

      <DashboardLayout title="Reports & Analytics">
        <div className="fade-in">
          {/* Report Controls - Hide on print */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">📄 Generate Custom Reports</h2>
                <p className="text-sm text-slate-600">Select a project scope and report type to generate detailed analytics</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Filter</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Report Type Cards - Hide on print */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 print:hidden">
            {reportTypes.map(report => (
              <div key={report.id} className={`bg-white border-2 border-${report.color}-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer`}>
                <div className="text-5xl mb-4">{report.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{report.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{report.description}</p>
                <button 
                  onClick={() => generateReport(report.id)}
                  className="btn btn-primary w-full"
                >
                  Generate Report
                </button>
              </div>
            ))}
          </div>

          {/* Generated Report Display */}
          {generatedReport && (
            <div ref={reportRef} className="bg-white rounded-xl shadow-lg border-2 border-blue-300 p-8">
              {/* Report Header */}
              <div className="border-b-2 border-blue-500 pb-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-jungle-green text-white px-4 py-2 rounded-lg font-black text-xl">
                        POWERGRID
                      </div>
                      <div className="text-xs text-slate-600">
                        Power Grid Corporation of India Ltd.
                      </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">
                      {reportTypes.find(r => r.id === generatedReport.type)?.name || 'Report'}
                    </h1>
                    <p className="text-slate-600">Scope: <strong>{generatedReport.project}</strong></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-1">Generated On</p>
                    <p className="text-lg font-bold text-slate-800">{generatedReport.generatedAt}</p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Key Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(generatedReport.metrics).map(([key, value]: any) => (
                    <div key={key} className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-blue-600 font-semibold mb-1 uppercase">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-black text-slate-800">
                        {typeof value === 'number' && key.toLowerCase().includes('value') || key.toLowerCase().includes('budget') || key.toLowerCase().includes('spent')
                          ? `₹${(value / 10000000).toFixed(2)}Cr`
                          : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Data Table */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">📋 Detailed Analysis</h2>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {generatedReport.details.length > 0 && 
                          Object.keys(generatedReport.details[0]).map((key) => (
                            <th key={key}>{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {generatedReport.details.map((row: any, idx: number) => (
                        <tr key={idx}>
                          {Object.entries(row).map(([key, value]: any, cellIdx) => (
                            <td key={cellIdx} className={cellIdx === 0 ? 'font-bold text-slate-800' : ''}>
                              {typeof value === 'number' && (key.toLowerCase().includes('value') || key.toLowerCase().includes('budget') || key.toLowerCase().includes('spent'))
                                ? `₹${(value / 100000).toFixed(2)}L`
                                : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons - Hide on print */}
              <div className="flex gap-4 pt-6 border-t border-slate-200 print:hidden">
                <button onClick={printReport} className="btn btn-primary flex-1">
                  🖨️ Print Report
                </button>
                <button onClick={downloadReport} className="btn btn-outline flex-1">
                  📥 Download PDF
                </button>
                <button onClick={() => setGeneratedReport(null)} className="btn btn-outline">
                  ❌ Close
                </button>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 pt-6 border-t border-slate-200 text-sm text-slate-500">
                <p>This report is generated by POWERGRID AI Forecasting & Procurement Management System</p>
                <p className="mt-1">© 2025 Power Grid Corporation of India Ltd. All rights reserved.</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!generatedReport && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center print:hidden">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Report Generated</h3>
              <p className="text-slate-600">Select a project filter and click on any report type above to generate a detailed report</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
