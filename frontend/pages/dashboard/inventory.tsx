import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../lib/api';

export default function Inventory() {
  const router = useRouter();
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock-overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showPOModal, setShowPOModal] = useState(false);
  const itemsPerPage = 10;

  const handleViewDetails = (material: any) => {
    setSelectedMaterial(material);
    setShowDetailsModal(true);
  };

  const handleCreatePO = (material: any) => {
    setSelectedMaterial(material);
    setShowPOModal(true);
  };

  const confirmCreatePO = () => {
    setShowPOModal(false);
    router.push('/dashboard/procurement');
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    setFilteredMaterials(filtered);
    setCurrentPage(1);
  }, [materials, searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadInventoryData = async () => {
    try {
      const [materialsData, forecastsData, projectsData] = await Promise.all([
        api.getMaterialsSummary(),
        api.getForecasts(),
        api.getProjectsSummary()
      ]);
      setMaterials(materialsData);
      setFilteredMaterials(materialsData);
      setForecasts(forecastsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setFilteredMaterials(materials);
    setCurrentPage(1);
  };

  const calculateInventoryHealth = () => {
    return {
      adequate: materials.filter(m => m.status === 'Good').length,
      low: materials.filter(m => m.status === 'Low').length,
      critical: materials.filter(m => m.status === 'Critical').length,
      shortfallMaterials: materials.filter(m => {
        const futureDemand = forecasts
          .filter(f => f.materialId === m.id && !f.actualQty)
          .reduce((sum, f) => sum + f.forecastedQty, 0);
        return (m.safetyStock + futureDemand) > (m.currentStock + (m.inTransit || 0));
      }).length
    };
  };

  const getShortfallMaterials = () => {
    return materials.filter(m => {
      const futureDemand = forecasts
        .filter(f => f.materialId === m.id && !f.actualQty)
        .reduce((sum, f) => sum + f.forecastedQty, 0);
      return (m.safetyStock + futureDemand) > (m.currentStock + (m.inTransit || 0));
    }).map(m => {
      const futureDemand = forecasts
        .filter(f => f.materialId === m.id && !f.actualQty)
        .reduce((sum, f) => sum + f.forecastedQty, 0);
      const totalNeeded = m.safetyStock + futureDemand;
      const totalAvailable = m.currentStock + (m.inTransit || 0);
      const shortfall = totalNeeded - totalAvailable;
      return { ...m, futureDemand, totalNeeded, totalAvailable, shortfall };
    });
  };

  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  if (loading) {
    return (
      <DashboardLayout title="Inventory Management">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const inventoryHealth = calculateInventoryHealth();
  const shortfallMaterials = getShortfallMaterials();

  return (
    <>
      <Head>
        <title>Inventory - POWERGRID</title>
      </Head>

      <DashboardLayout title="Inventory Management">
        <div className="fade-in">
          {/* Inventory Health Dashboard */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 rounded-2xl shadow-lg text-white mb-6">
            <h2 className="text-3xl font-bold mb-4">Inventory Health Monitor</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm font-medium">Total Materials</p>
                <p className="text-3xl font-bold mt-1">{materials.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm font-medium">Adequate Stock</p>
                <p className="text-3xl font-bold mt-1 text-green-300">{inventoryHealth.adequate}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm font-medium">Low Stock</p>
                <p className="text-3xl font-bold mt-1 text-yellow-300">{inventoryHealth.low}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm font-medium">Critical Items</p>
                <p className="text-3xl font-bold mt-1 text-red-300">{inventoryHealth.critical}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm font-medium">Projected Shortfalls</p>
                <p className="text-3xl font-bold mt-1 text-orange-300">{inventoryHealth.shortfallMaterials}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="border-b border-slate-200">
              <div className="flex gap-2 p-4">
                <button
                  className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all ${
                    activeTab === 'stock-overview'
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setActiveTab('stock-overview')}
                >
                  📦 Stock Overview
                </button>
                <button
                  className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all ${
                    activeTab === 'project-view'
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setActiveTab('project-view')}
                >
                  🏗️ Project-Wise View
                </button>
                <button
                  className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all ${
                    activeTab === 'shortfalls'
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setActiveTab('shortfalls')}
                >
                  ⚠️ Projected Shortfalls
                </button>
                <button
                  className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all ${
                    activeTab === 'forecast-timeline'
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setActiveTab('forecast-timeline')}
                >
                  📈 Demand Forecast
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Stock Overview Tab */}
              {activeTab === 'stock-overview' && (
                <div>
                  {/* Filter and Search */}
                  <div className="bg-slate-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                        <input
                          type="text"
                          placeholder="Material name..."
                          className="w-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                        <select
                          className="w-full"
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="Towers">Towers</option>
                          <option value="Conductors">Conductors</option>
                          <option value="Insulators">Insulators</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Hardware">Hardware</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                        <select
                          className="w-full"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="Good">Good</option>
                          <option value="Low">Low</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button onClick={resetFilters} className="btn btn-secondary w-full">
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Material Table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Category</th>
                          <th>Current Stock</th>
                          <th>Available</th>
                          <th>Reorder Level</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedMaterials.map((m) => {
                          const futureDemand = forecasts
                            .filter(f => f.materialId === m.id && !f.actualQty)
                            .reduce((sum, f) => sum + f.forecastedQty, 0);
                          const projectedGap = (m.safetyStock + futureDemand) - (m.currentStock + (m.inTransit || 0));

                          return (
                            <tr key={m.id}>
                              <td>
                                <div>
                                  <p className="font-bold text-slate-800">{m.name}</p>
                                  <p className="text-xs text-slate-500">{m.id}</p>
                                </div>
                              </td>
                              <td><span className="badge badge-info text-xs">{m.category}</span></td>
                              <td className="font-bold">{m.currentStock.toLocaleString()} {m.unit}</td>
                              <td className="text-green-700 font-bold">{m.available.toLocaleString()} {m.unit}</td>
                              <td className="text-orange-600 font-semibold">{m.reorderLevel.toLocaleString()} {m.unit}</td>
                              <td>
                                <span className={`badge text-xs ${
                                  m.status === 'Critical' ? 'badge-danger' :
                                  m.status === 'Low' ? 'badge-warning' :
                                  'badge-success'
                                }`}>
                                  {m.status}
                                </span>
                                {projectedGap > 0 && (
                                  <><br /><span className="badge badge-danger text-xs mt-1">Future Shortage</span></>
                                )}
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleViewDetails(m)}
                                  className="text-teal-500 hover:text-teal-700 font-semibold text-xs"
                                >
                                  📊 Details
                                </button>
                                {projectedGap > 0 && (
                                  <><br /><button 
                                    onClick={() => handleCreatePO(m)}
                                    className="text-blue-500 hover:text-blue-700 font-semibold text-xs mt-1"
                                  >
                                    🛒 Create PO
                                  </button></>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm font-semibold text-slate-700">
                      Showing <span className="text-teal-600">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredMaterials.length)}</span> of <span className="text-teal-600">{filteredMaterials.length}</span> materials
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${ 
                          currentPage === 1
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105'
                        }`}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-110 ${
                              pageNum === currentPage
                                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-110'
                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-teal-500 hover:text-teal-600'
                            }`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          currentPage === totalPages
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105'
                        }`}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Project-Wise View Tab */}
              {activeTab === 'project-view' && (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Material Requirements by Project</h3>
                        <p className="text-sm text-slate-600 mt-1">Select a project to view and manage its material allocations</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Select Project to View</label>
                      <select
                        className="w-full md:w-1/2"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                      >
                        <option value="">-- Choose a project --</option>
                        {projects.filter(p => p.status !== 'Completed').map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {p.location} ({p.completion}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedProject ? (
                    <div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Project: {projects.find(p => p.id === selectedProject)?.name}</h4>
                        <p className="text-sm text-blue-700">Showing material allocation and requirements for this project</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Material</th>
                              <th>Category</th>
                              <th>Required Qty</th>
                              <th>Allocated</th>
                              <th>Remaining Need</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materials.slice(0, 8).map((m, idx) => {
                              const requiredQty = Math.floor(m.requiredQty * (Math.random() * 0.3 + 0.5));
                              const allocated = Math.floor(requiredQty * (Math.random() * 0.6 + 0.2));
                              const remaining = requiredQty - allocated;
                              return (
                                <tr key={m.id}>
                                  <td className="font-bold text-slate-800">{m.name}</td>
                                  <td><span className="badge badge-info text-xs">{m.category}</span></td>
                                  <td className="font-semibold">{requiredQty.toLocaleString()} {m.unit}</td>
                                  <td className="text-green-600 font-semibold">{allocated.toLocaleString()} {m.unit}</td>
                                  <td className="text-orange-600 font-semibold">{remaining.toLocaleString()} {m.unit}</td>
                                  <td>
                                    <span className={`badge ${remaining > requiredQty * 0.5 ? 'badge-danger' : remaining > 0 ? 'badge-warning' : 'badge-success'}`}>
                                      {remaining > requiredQty * 0.5 ? 'Critical' : remaining > 0 ? 'Partial' : 'Complete'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <p className="text-lg font-medium">Select a project to view its materials</p>
                    </div>
                  )}
                </div>
              )}

              {/* Projected Shortfalls Tab */}
              {activeTab === 'shortfalls' && (
                <div>
                  {shortfallMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {shortfallMaterials.map((m) => {
                        const recommendedOrder = Math.ceil(m.shortfall * 1.1);
                        const estimatedCost = recommendedOrder * m.costPerUnit;

                        return (
                          <div key={m.id} className="border-2 border-red-200 rounded-lg p-6 bg-red-50/50">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-slate-800 text-lg">{m.name}</h4>
                                <p className="text-sm text-slate-600 mt-1">{m.category} • Lead Time: {m.leadTime} days</p>
                              </div>
                              <span className="badge badge-danger">Shortage Risk</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Current + In Transit</p>
                                <p className="text-xl font-bold text-blue-600">{m.totalAvailable.toLocaleString()} {m.unit}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Safety + Forecast Need</p>
                                <p className="text-xl font-bold text-purple-600">{m.totalNeeded.toLocaleString()} {m.unit}</p>
                              </div>
                            </div>

                            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-semibold text-red-800">Projected Shortfall</p>
                                  <p className="text-2xl font-black text-red-600 mt-1">{m.shortfall.toLocaleString()} {m.unit}</p>
                                </div>
                                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                              </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <p className="text-sm font-semibold text-blue-800 mb-3">💡 Recommended Action</p>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-blue-600 font-medium">Order Quantity</p>
                                  <p className="font-bold text-blue-900">{recommendedOrder.toLocaleString()} {m.unit}</p>
                                </div>
                                <div>
                                  <p className="text-blue-600 font-medium">Estimated Cost</p>
                                  <p className="font-bold text-blue-900">₹{(estimatedCost / 100000).toFixed(2)}L</p>
                                </div>
                                <div>
                                  <p className="text-blue-600 font-medium">Supplier</p>
                                  <p className="font-bold text-blue-900">{m.supplierName}</p>
                                </div>
                                <div>
                                  <p className="text-blue-600 font-medium">Lead Time</p>
                                  <p className="font-bold text-blue-900">{m.leadTime} days</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <button className="btn btn-primary flex-1 text-sm">
                                🛒 Create Purchase Order
                              </button>
                              <button className="btn btn-outline text-sm">
                                📊 View Forecasts
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <svg className="w-20 h-20 mx-auto mb-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-xl font-bold text-green-600">✓ No Projected Shortfalls</p>
                      <p className="text-sm mt-2">Current inventory and in-transit orders are sufficient to meet forecasted demand</p>
                    </div>
                  )}
                </div>
              )}

              {/* Demand Forecast Timeline Tab */}
              {activeTab === 'forecast-timeline' && (
                <div className="space-y-6">
                  {Array.from(new Set(forecasts.map(f => f.month))).sort().slice(0, 6).map(month => (
                    <div key={month} className="border border-slate-200 rounded-lg p-5">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {forecasts.filter(f => f.month === month).map(f => {
                          const material = materials.find(m => m.id === f.materialId);
                          const project = projects.find(p => p.id === f.projectId);
                          return (
                            <div key={f.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-semibold text-slate-800">{material?.name || 'Unknown'}</p>
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                                  {f.confidence.toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-2xl font-black text-purple-600 mb-1">{f.forecastedQty.toLocaleString()}</p>
                              <p className="text-xs text-slate-600">{material?.unit || 'units'} • {project?.name || 'Unknown Project'}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Material Details Modal */}
        {showDetailsModal && selectedMaterial && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-2xl z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedMaterial.name}</h2>
                    <p className="text-teal-100 text-sm">Material ID: {selectedMaterial.id}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <span className={`badge text-lg px-4 py-2 ${
                    selectedMaterial.status === 'Critical' ? 'badge-danger' :
                    selectedMaterial.status === 'Low' ? 'badge-warning' : 'badge-success'
                  }`}>
                    {selectedMaterial.status}
                  </span>
                  <span className="badge badge-info text-lg px-4 py-2">{selectedMaterial.category}</span>
                </div>

                {/* Stock Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <p className="text-xs text-green-600 font-semibold mb-1">CURRENT STOCK</p>
                    <p className="text-2xl font-bold text-slate-800">{selectedMaterial.currentStock.toLocaleString()} {selectedMaterial.unit}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-1">AVAILABLE</p>
                    <p className="text-2xl font-bold text-slate-800">{selectedMaterial.available.toLocaleString()} {selectedMaterial.unit}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <p className="text-xs text-purple-600 font-semibold mb-1">IN TRANSIT</p>
                    <p className="text-2xl font-bold text-slate-800">{(selectedMaterial.inTransit || 0).toLocaleString()} {selectedMaterial.unit}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <p className="text-xs text-orange-600 font-semibold mb-1">SAFETY STOCK</p>
                    <p className="text-2xl font-bold text-slate-800">{selectedMaterial.safetyStock.toLocaleString()} {selectedMaterial.unit}</p>
                  </div>
                </div>

                {/* Forecast Analysis */}
                <div className="bg-slate-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Demand Forecast Analysis
                  </h3>
                  {(() => {
                    const futureDemand = forecasts
                      .filter(f => f.materialId === selectedMaterial.id && !f.actualQty)
                      .reduce((sum, f) => sum + f.forecastedQty, 0);
                    const totalAvailable = selectedMaterial.currentStock + (selectedMaterial.inTransit || 0);
                    const projectedGap = (selectedMaterial.safetyStock + futureDemand) - totalAvailable;
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-slate-600">Future Demand:</span>
                          <span className="font-bold text-blue-600">{futureDemand.toLocaleString()} {selectedMaterial.unit}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-slate-600">Total Available (Stock + In Transit):</span>
                          <span className="font-bold text-green-600">{totalAvailable.toLocaleString()} {selectedMaterial.unit}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-slate-600">Required Level (Safety + Demand):</span>
                          <span className="font-bold text-purple-600">{(selectedMaterial.safetyStock + futureDemand).toLocaleString()} {selectedMaterial.unit}</span>
                        </div>
                        {projectedGap > 0 ? (
                          <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                            <span className="text-red-700 font-semibold">⚠️ Projected Shortfall:</span>
                            <span className="font-bold text-red-600">{projectedGap.toLocaleString()} {selectedMaterial.unit}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-green-700 font-semibold">✅ Stock Adequate:</span>
                            <span className="font-bold text-green-600">No shortfall projected</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {(() => {
                    const futureDemand = forecasts
                      .filter(f => f.materialId === selectedMaterial.id && !f.actualQty)
                      .reduce((sum, f) => sum + f.forecastedQty, 0);
                    const projectedGap = (selectedMaterial.safetyStock + futureDemand) - (selectedMaterial.currentStock + (selectedMaterial.inTransit || 0));
                    return projectedGap > 0 ? (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleCreatePO(selectedMaterial);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        🛒 Create Purchase Order
                      </button>
                    ) : null;
                  })()}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create PO Modal */}
        {showPOModal && selectedMaterial && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold">Create Purchase Order</h2>
                <p className="text-blue-100 text-sm mt-1">For: {selectedMaterial.name}</p>
              </div>

              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Material Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-blue-600">Current Stock:</p>
                      <p className="font-bold text-slate-800">{selectedMaterial.currentStock.toLocaleString()} {selectedMaterial.unit}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Suggested Order Qty:</p>
                      <p className="font-bold text-orange-600">
                        {(() => {
                          const futureDemand = forecasts.filter(f => f.materialId === selectedMaterial.id && !f.actualQty).reduce((sum, f) => sum + f.forecastedQty, 0);
                          const gap = (selectedMaterial.safetyStock + futureDemand) - (selectedMaterial.currentStock + (selectedMaterial.inTransit || 0));
                          return Math.max(gap, selectedMaterial.reorderLevel).toLocaleString();
                        })()} {selectedMaterial.unit}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6">
                  You&apos;ll be redirected to the Procurement page where you can complete the purchase order with supplier selection and delivery details.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={confirmCreatePO}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Continue to Procurement
                  </button>
                  <button
                    onClick={() => setShowPOModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
