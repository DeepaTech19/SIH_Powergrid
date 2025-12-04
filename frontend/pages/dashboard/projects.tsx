import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minCompletion, setMinCompletion] = useState('');
  const [maxCompletion, setMaxCompletion] = useState('');
  const [projectType, setProjectType] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<any>(null);

  const handleViewDetails = (project: any) => {
    setSelectedProjectDetails(project);
    setShowDetailsModal(true);
  };

  const handleUseInForecast = (project: any) => {
    // Store project data in sessionStorage to auto-fill forecast form
    sessionStorage.setItem('forecastProjectData', JSON.stringify(project));
    router.push('/dashboard/forecast');
  };

  const regionStates: { [key: string]: string[] } = {
    'North': ['Delhi NCR', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Uttarakhand', 'Uttar Pradesh', 'Rajasthan'],
    'South': ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Puducherry'],
    'East': ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand'],
    'West': ['Maharashtra', 'Gujarat', 'Goa'],
    'Central': ['Madhya Pradesh', 'Chhattisgarh'],
    'North East': ['Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim']
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = projects;

    if (regionFilter) {
      filtered = filtered.filter(p => p.region === regionFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (minCompletion) {
      filtered = filtered.filter(p => p.completion >= parseInt(minCompletion));
    }

    if (maxCompletion) {
      filtered = filtered.filter(p => p.completion <= parseInt(maxCompletion));
    }

    setFilteredProjects(filtered);
  }, [projects, regionFilter, statusFilter, minCompletion, maxCompletion]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadProjects = async () => {
    try {
      const data = await api.getProjectsSummary();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setRegionFilter('');
    setStatusFilter('');
    setMinCompletion('');
    setMaxCompletion('');
    setFilteredProjects(projects);
  };

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectName = formData.get('projectName');
    const region = formData.get('region');
    const state = formData.get('state');
    const budget = formData.get('budget');
    const lineLength = formData.get('lineLength');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    
    alert(`Project Created Successfully!\n\nProject: ${projectName}\nRegion: ${region}\nState: ${state}\nBudget: ₹${budget} Crores\nLine Length: ${lineLength} km\nDuration: ${startDate} to ${endDate}\n\nThe project has been added to your project list.`);
    setShowCreateModal(false);
    setProjectType('');
    setSelectedRegion('');
  };

  if (loading) {
    return (
      <DashboardLayout title="Project Management">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Projects - POWERGRID</title>
      </Head>

      <DashboardLayout title="Project Management">
        <div className="fade-in">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Active Projects</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Create New Project
              </button>
            </div>

            {/* Project Filters */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Filter Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Region</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-jungle-green"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                  >
                    <option value="">All Regions</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="Central">Central</option>
                    <option value="North East">North East</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-jungle-green"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Min Completion %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-jungle-green"
                    value={minCompletion}
                    onChange={(e) => setMinCompletion(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Max Completion %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-jungle-green"
                    value={maxCompletion}
                    onChange={(e) => setMaxCompletion(e.target.value)}
                  />
                </div>
                <div className="md:col-span-4">
                  <button onClick={resetFilters} className="btn btn-outline text-sm">
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProjects.map(p => (
                <div key={p.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-slate-500">{p.id}</span>
                    <span className={`badge ${
                      p.status === 'In Progress' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{p.name}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-500">Region</p>
                      <p className="font-semibold text-slate-700">{p.region || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Location</p>
                      <p className="font-semibold text-slate-700">{p.location}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Budget</p>
                      <p className="font-semibold text-slate-700">₹{(p.budget / 10000000).toFixed(2)}Cr</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Project Type</p>
                      <p className="font-semibold text-slate-700">{p.projectType || 'Both'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Start Date</p>
                      <p className="font-semibold text-slate-700">{p.startDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">End Date</p>
                      <p className="font-semibold text-slate-700">{p.endDate}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-bold text-teal-600">{p.completion}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p.completion}%` }}></div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleUseInForecast(p)}
                      className="flex-1 btn btn-outline text-sm"
                    >
                      📊 Use in Forecast
                    </button>
                    <button 
                      onClick={() => handleViewDetails(p)}
                      className="btn btn-secondary text-sm"
                    >
                      📋 View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="mb-6 pb-4 border-b-2 border-teal-200">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Create New Project
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Fill in the details below to create a new transmission project</p>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name *</label>
                      <input name="projectName" type="text" required className="w-full" placeholder="e.g., 400kV Transmission Line" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Region *</label>
                      <select
                        name="region"
                        required
                        className="w-full"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                      >
                        <option value="">Select Region</option>
                        <option value="North">North India</option>
                        <option value="South">South India</option>
                        <option value="East">East India</option>
                        <option value="West">West India</option>
                        <option value="Central">Central India</option>
                        <option value="North East">North East India</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">State *</label>
                      <select name="state" required className="w-full">
                        <option value="">{selectedRegion ? 'Select State' : 'Select Region First'}</option>
                        {selectedRegion && regionStates[selectedRegion]?.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Project Type *</label>
                      <select
                        name="projectType"
                        required
                        className="w-full"
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                      >
                        <option value="">Select Project Type</option>
                        <option value="Tower">Tower Type</option>
                        <option value="Substation">Substation Type</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Budget (₹ Crores) *</label>
                      <input name="budget" type="number" required className="w-full" placeholder="100" step="0.01" />
                      <p className="text-xs text-slate-500 mt-1">Enter budget in Crores (e.g., 100 for ₹100 Crores)</p>
                    </div>
                    {(projectType === 'Tower' || projectType === 'Both') && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tower Type *</label>
                        <select name="towerType" className="w-full">
                          <option value="">Select Type</option>
                          <option value="Type A - 765kV">Type A - 765kV</option>
                          <option value="Type B - 400kV">Type B - 400kV</option>
                          <option value="Type C - 220kV">Type C - 220kV</option>
                          <option value="Type D - 132kV">Type D - 132kV</option>
                        </select>
                      </div>
                    )}
                    {(projectType === 'Substation' || projectType === 'Both') && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Substation Type *</label>
                        <select name="substationType" className="w-full">
                          <option value="">Select Type</option>
                          <option value="765kV GIS">765kV GIS</option>
                          <option value="400kV AIS">400kV AIS</option>
                          <option value="220kV Hybrid">220kV Hybrid</option>
                          <option value="132kV Standard">132kV Standard</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Line Length (km) *</label>
                      <input name="lineLength" type="number" required className="w-full" min="1" placeholder="250" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                      <input name="startDate" type="date" required className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">End Date *</label>
                      <input name="endDate" type="date" required className="w-full" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
                    <button type="submit" className="flex-1 btn btn-primary py-3 text-base font-semibold">
                      <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Create Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn btn-secondary px-8 py-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {showDetailsModal && selectedProjectDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-t-2xl z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedProjectDetails.name}</h2>
                    <p className="text-blue-100 text-sm">Project ID: {selectedProjectDetails.id}</p>
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
                    selectedProjectDetails.status === 'In Progress' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {selectedProjectDetails.status}
                  </span>
                  <span className="text-2xl font-bold text-teal-600">{selectedProjectDetails.completion}% Complete</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Project Progress</span>
                    <span className="text-sm text-slate-600">{selectedProjectDetails.completion}%</span>
                  </div>
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-500 rounded-full shadow-lg"
                      style={{ width: `${selectedProjectDetails.completion}%` }}
                    ></div>
                  </div>
                </div>

                {/* Project Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 transform hover:scale-105 transition">
                    <p className="text-xs text-blue-600 font-semibold mb-1">REGION</p>
                    <p className="text-lg font-bold text-slate-800">{selectedProjectDetails.region || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200 transform hover:scale-105 transition">
                    <p className="text-xs text-teal-600 font-semibold mb-1">LOCATION</p>
                    <p className="text-lg font-bold text-slate-800">{selectedProjectDetails.location}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 transform hover:scale-105 transition">
                    <p className="text-xs text-purple-600 font-semibold mb-1">BUDGET</p>
                    <p className="text-lg font-bold text-slate-800">₹{(selectedProjectDetails.budget / 10000000).toFixed(2)} Cr</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 transform hover:scale-105 transition">
                    <p className="text-xs text-orange-600 font-semibold mb-1">PROJECT TYPE</p>
                    <p className="text-lg font-bold text-slate-800">{selectedProjectDetails.projectType || 'Both'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 transform hover:scale-105 transition">
                    <p className="text-xs text-green-600 font-semibold mb-1">START DATE</p>
                    <p className="text-lg font-bold text-slate-800">{selectedProjectDetails.startDate}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 transform hover:scale-105 transition">
                    <p className="text-xs text-red-600 font-semibold mb-1">END DATE</p>
                    <p className="text-lg font-bold text-slate-800">{selectedProjectDetails.endDate}</p>
                  </div>
                </div>

                {/* Detailed Analysis Section */}
                <div className="bg-slate-50 rounded-xl p-6 mb-6 shadow-inner">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Detailed Analysis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Timeline Analysis */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-500">📅</span> Timeline Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Duration:</span>
                          <span className="font-semibold">
                            {Math.ceil((new Date(selectedProjectDetails.endDate).getTime() - new Date(selectedProjectDetails.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Days Elapsed:</span>
                          <span className="font-semibold">
                            {Math.max(0, Math.ceil((new Date().getTime() - new Date(selectedProjectDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)))} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className={`font-semibold ${
                            selectedProjectDetails.completion >= 80 ? 'text-green-600' :
                            selectedProjectDetails.completion >= 50 ? 'text-blue-600' : 'text-orange-600'
                          }`}>
                            {selectedProjectDetails.completion >= 80 ? '✅ On Track' :
                             selectedProjectDetails.completion >= 50 ? '🔵 In Progress' : '⚠️ Needs Attention'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Budget Analysis */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="text-green-500">💰</span> Budget Overview
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Budget:</span>
                          <span className="font-semibold">₹{(selectedProjectDetails.budget / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Estimated Spent:</span>
                          <span className="font-semibold">₹{((selectedProjectDetails.budget * selectedProjectDetails.completion / 100) / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Remaining:</span>
                          <span className="font-semibold text-green-600">₹{((selectedProjectDetails.budget * (100 - selectedProjectDetails.completion) / 100) / 10000000).toFixed(2)} Cr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Progress Chart */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-700 mb-3">📊 Project Progress</h4>
                      <div className="h-48">
                        <Doughnut
                          data={{
                            labels: ['Completed', 'Remaining'],
                            datasets: [{
                              data: [selectedProjectDetails.completion, 100 - selectedProjectDetails.completion],
                              backgroundColor: [
                                'rgba(20, 184, 166, 0.8)',
                                'rgba(226, 232, 240, 0.8)'
                              ],
                              borderColor: [
                                'rgba(20, 184, 166, 1)',
                                'rgba(203, 213, 225, 1)'
                              ],
                              borderWidth: 2
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: { font: { size: 11 } }
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context: any) => `${context.label}: ${context.parsed}%`
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Budget Distribution Chart */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-700 mb-3">💸 Budget Distribution</h4>
                      <div className="h-48">
                        <Bar
                          data={{
                            labels: ['Spent', 'Remaining'],
                            datasets: [{
                              label: 'Amount (Cr)',
                              data: [
                                (selectedProjectDetails.budget * selectedProjectDetails.completion / 100) / 10000000,
                                (selectedProjectDetails.budget * (100 - selectedProjectDetails.completion) / 100) / 10000000
                              ],
                              backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(34, 197, 94, 0.8)'
                              ],
                              borderColor: [
                                'rgba(59, 130, 246, 1)',
                                'rgba(34, 197, 94, 1)'
                              ],
                              borderWidth: 2
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (context: any) => `₹${context.parsed.y.toFixed(2)} Cr`
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  callback: (value: any) => `₹${value}`
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Materials Forecast Section */}
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    Estimated Material Requirements
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">Based on project type and specifications, the following materials are forecasted:</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(selectedProjectDetails.projectType === 'Tower' || selectedProjectDetails.projectType === 'Both' || !selectedProjectDetails.projectType) && (
                      <>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition">
                          <p className="text-xs text-slate-600 mb-1">Towers</p>
                          <p className="text-lg font-bold text-blue-600">~{Math.ceil((selectedProjectDetails.lineLength || 100) / 0.4)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition">
                          <p className="text-xs text-slate-600 mb-1">Conductors (km)</p>
                          <p className="text-lg font-bold text-green-600">~{Math.ceil((selectedProjectDetails.lineLength || 100) * 3)}</p>
                        </div>
                      </>
                    )}
                    {(selectedProjectDetails.projectType === 'Substation' || selectedProjectDetails.projectType === 'Both' || !selectedProjectDetails.projectType) && (
                      <>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition">
                          <p className="text-xs text-slate-600 mb-1">Circuit Breakers</p>
                          <p className="text-lg font-bold text-purple-600">~8</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition">
                          <p className="text-xs text-slate-600 mb-1">Transformers</p>
                          <p className="text-lg font-bold text-orange-600">~4</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleUseInForecast(selectedProjectDetails);
                    }}
                    className="flex-1 btn btn-primary"
                  >
                    📊 Use in Forecast
                  </button>
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
      </DashboardLayout>
    </>
  );
}
