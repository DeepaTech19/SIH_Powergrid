import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);


export default function Forecast() {
  const [activeTab, setActiveTab] = useState('new-forecast');
  const [projects, setProjects] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [projectType, setProjectType] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showProjectSelect, setShowProjectSelect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatedForecast, setGeneratedForecast] = useState<any>(null);
  const [formData, setFormData] = useState({
    projectName: '',
    projectCategory: 'Transmission',
    budget: '',
    region: '',
    location: '',
    terrain: 'Mixed',
    startDate: '',
    endDate: '',
    lineLength: '',
    distanceFromStorage: '',
    towerType: '',
    substationType: ''
  });

  const tabItems = [
    { id: 'new-forecast', label: 'New Forecast', description: 'Configure AI inputs' },
    { id: 'forecast-history', label: 'Forecast History', description: 'Track previous runs' },
    { id: 'material-forecast', label: 'Material Projection', description: 'View AI output' }
  ];

  const regionStates: Record<string, string[]> = {
    'North': ['Delhi NCR', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Uttarakhand', 'Uttar Pradesh', 'Rajasthan'],
    'South': ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Puducherry'],
    'East': ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand'],
    'West': ['Maharashtra', 'Gujarat', 'Goa'],
    'Central': ['Madhya Pradesh', 'Chhattisgarh'],
    'North East': ['Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim']
  };

  useEffect(() => {
    loadData();

    const storedProjectData = sessionStorage.getItem('forecastProjectData');
    if (storedProjectData) {
      const project = JSON.parse(storedProjectData);
      setSelectedProjectId(project.id);
      setFormData({
        projectName: project.name,
        projectCategory: project.projectCategory || project.projectType || 'Transmission',
        budget: (project.budget / 10000000).toFixed(2),
        region: project.region || '',
        location: project.location || '',
        terrain: project.terrain || 'Mixed',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        lineLength: project.lineLength || '',
        distanceFromStorage: project.distanceFromStorage ? String(project.distanceFromStorage) : '',
        towerType: project.towerType || '',
        substationType: project.substationType || ''
      });
      if (project.towerType && project.substationType) {
        setProjectType('Both');
      } else if (project.towerType) {
        setProjectType('Tower');
      } else if (project.substationType) {
        setProjectType('Substation');
      }
      sessionStorage.removeItem('forecastProjectData');
      setActiveTab('new-forecast');
    }
  }, []);

  const loadData = async () => {
    try {
      const [projectsList, forecastsListRaw, materialsList] = await Promise.all([
        api.getProjectsSummary(),
        api.getForecasts(),
        api.getMaterialsSummary()
      ]);

      // Normalize forecasts to an array (backend may return 404 / object)
      const forecastsListRaw_ = Array.isArray(forecastsListRaw)
        ? forecastsListRaw
        : (forecastsListRaw?.forecasts ?? []);

      // Map backend response to frontend field names
      const forecastsList = forecastsListRaw_.map((item: any) => ({
        projectName: item.project_name,
        estimatedCost: item.total,
        actualCost: item.budget,
        accuracy: item.accuracy,
        status: item.status
      }));

      setProjects(projectsList);
      setForecasts(forecastsList);
      setMaterials(materialsList);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectType) {
      alert('Please select a project type');
      return;
    }

    setLoading(true);
    try {
      const forecast = await api.saveForecastAndPredict({
        ...formData,
        projectType,
        budget: parseFloat(formData.budget) * 10000000,
        projectId: selectedProjectId,
        lineLength: parseFloat(formData.lineLength) || 100
      });

      setGeneratedForecast(forecast);
      setActiveTab('new-forecast');
      await loadData();
    } catch (error) {
      console.error('Failed to generate forecast:', error);
      alert('Failed to generate forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const forecastStats = (() => {
    const total = Array.isArray(forecasts) ? forecasts.length : 0;
    const active = Array.isArray(forecasts) ? forecasts.filter(f => !f.actualQty).length : 0;
    const projected = Array.isArray(materials) ? materials.filter(m => m.projectedShortfall > 0).length : 0;
    return {
      totalForecasts: total,
      activeForecasts: active,
      accuracy: 94.0,
      projectedShortages: projected
    };
  })();

  const MATERIAL_GROUPS: Record<string, string> = {
    // FOUNDATION
    "cement_bags": "Foundation",
    "concrete_mix_cum": "Foundation",
    "sand_tons": "Foundation",
    "aggregate_tons": "Foundation",
    "backfill_soil_cum (m3)": "Foundation",
    "excavated_soil_cum (m3)": "Foundation",
    "gravel_tons": "Foundation",

    // STEEL & STRUCTURE
    "tower_steel_kg": "Steel & Structure",
    "reinforcement_steel_kg": "Steel & Structure",
    "angle_steel_sections_kg": "Steel & Structure",
    "tower_legs_kg": "Steel & Structure",
    "tower_body_members_kg": "Steel & Structure",
    "extension_pieces_kg": "Steel & Structure",
    "pack_plates_kg": "Steel & Structure",
    "tower_parts_units": "Steel & Structure",

    // ELECTRICAL EQUIPMENT
    "CT_units": "Electrical Equipment",
    "PT_units": "Electrical Equipment",
    "isolator_units": "Electrical Equipment",
    "circuit_breaker_units": "Electrical Equipment",
    "harmonic_filter_units": "Electrical Equipment",
    "smoothing_reactor_units": "Electrical Equipment",
    "thyristor_valve_units": "Electrical Equipment",
    "switchgear_units": "Electrical Equipment",
    "transformer_oil_liters (liters)": "Electrical Equipment",
    "converter_transformer_oil_liters": "Electrical Equipment",

    // HARDWARE & FITTINGS
    "bolts_nuts_qty": "Hardware & Fittings",
    "washers_qty": "Hardware & Fittings",
    "hardware_fittings_units": "Hardware & Fittings",
    "clamps_units": "Hardware & Fittings",
    "spare_clamps_units": "Hardware & Fittings",
    "spacers_units": "Hardware & Fittings",
    "insulator_discs_units": "Hardware & Fittings",
    "extra_insulator_units": "Hardware & Fittings",
    "arcing_horn_units": "Hardware & Fittings",

    // CONDUCTORS & WIRES
    "conductor_km": "Conductors & Wires",
    "spare_conductor_m": "Conductors & Wires",
    "jumpers_m": "Conductors & Wires",
    "guy_rope_m": "Conductors & Wires",
    "earth_wire_km": "Conductors & Wires",
    "OPGW_km": "Conductors & Wires",
    "DC_cable_km": "Conductors & Wires",
    "earthing_cable_m": "Conductors & Wires",
    "stay_wire_kg": "Conductors & Wires",

    // CABLES
    "control_cable_m": "Cables",
    "spare_OPGW_m (m)": "Cables",

    // CHEMICALS
    "curing_compound_liters": "Chemicals",
    "formwork_oil_liters": "Chemicals",
    "lubrication_grease_kg": "Chemicals",
    "paint_liters": "Chemicals",
    "water_liters": "Chemicals",
    "binding_wire_kg": "Chemicals",

    // MECHANICAL
    "ladder_units": "Mechanical",
    "packing_material_kg": "Mechanical",

    // ENVIRONMENT
    "environment_charges_lakhs": "Environment",

    // MISC
    "min_diesel_litre": "Miscellaneous",
  };

  const renderForecastDetail = (context: 'inline' | 'tab') => {
    if (!generatedForecast) {
      if (context === 'tab') {
        return (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Forecast Generated</h3>
            <p className="text-slate-600 mb-6">Generate a forecast from the &quot;New Forecast&quot; tab to view detailed material projections and charts</p>
            <button
              onClick={() => setActiveTab('new-forecast')}
              className="btn btn-primary"
            >
              Create New Forecast
            </button>
          </div>
        );
      }
      return null;
    }

    const gfMaterials: any[] = Array.isArray(generatedForecast?.materials) ? generatedForecast.materials : [];
    const showFullLayout = context === 'inline';

    // Helper: get group for material
    const getMaterialGroup = (materialName: string): string => {
      if (materialName in MATERIAL_GROUPS) {
        return MATERIAL_GROUPS[materialName];
      }
      if (materialName.endsWith("_price")) {
        return "Estimate";
      }
      return "Miscellaneous";
    };

    // Helper: group materials and sum costs
    const getGroupedData = () => {
      const groups: Record<string, { materials: string[], totalCost: number }> = {};
      gfMaterials.forEach((m: any) => {
        const group = getMaterialGroup(m.name);
        if (!groups[group]) {
          groups[group] = { materials: [], totalCost: 0 };
        }
        groups[group].materials.push(m.name);
        groups[group].totalCost += Number(m.totalCost || 0);
      });
      return groups;
    };

    return (
      <div className="print:p-0">
        {showFullLayout && (
        <div className="hidden print:block print:mb-2 print:pb-2 print:border-b print:border-slate-400">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-800 mb-1 print:text-base print:mb-0">POWERGRID</h1>
              <p className="text-sm text-slate-600 print:text-[8px]">AI-Powered Material Demand Forecast Report</p>
            </div>
            <div className="text-right text-sm print:text-[8px]">
              <p className="font-bold">Generated: {generatedForecast.generatedDate}</p>
              <p className="text-slate-600">Forecast ID: {generatedForecast.forecastId}</p>
            </div>
          </div>
        </div>
        )}

        {showFullLayout && (
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h3 className="text-xl font-bold text-slate-800">AI-Generated Material Demand Forecast</h3>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="btn btn-primary"
            >
              🖨️ Print Report
            </button>
            <button
              onClick={() => {
                setGeneratedForecast(null);
                setActiveTab('new-forecast');
              }}
              className="btn btn-outline"
            >
              ✨ New Forecast
            </button>
          </div>
        </div>
        )}

        {showFullLayout && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200 rounded-xl p-6 mb-6 print:p-2 print:mb-2 print:border print:border-slate-400 print:rounded">
          <h4 className="text-lg font-bold text-slate-800 mb-4 print:text-[10px] print:mb-1 print:font-bold">📋 Project Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-1">
            <div>
              <p className="text-xs text-slate-600 mb-1 print:text-[8px] print:mb-0">Project Name</p>
              <p className="font-bold text-slate-800 print:text-[9px]">{generatedForecast.projectName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1 print:text-[8px] print:mb-0">Project Type</p>
              <p className="font-bold text-slate-800 print:text-[9px]">{generatedForecast.projectType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1 print:text-[8px] print:mb-0">Region</p>
              <p className="font-bold text-slate-800 print:text-[9px]">{generatedForecast.region}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1 print:text-[8px] print:mb-0">Location</p>
              <p className="font-bold text-slate-800 print:text-[9px]">{generatedForecast.location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1 print:text-[8px] print:mb-0">Line Length</p>
              <p className="font-bold text-slate-800 print:text-[9px]">{generatedForecast.lineLength || 'N/A'} km</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1 print:text-[8px] print:mb-0">AI Confidence</p>
              <p className="font-bold text-green-600 print:text-[9px]">{generatedForecast.confidence}%</p>
            </div>
          </div>
        </div>
        )}

        {showFullLayout && (
        <div className="flex flex-col gap-8">
  {/* Line Chart (LOG SCALE + visible small values) */}
<div className="bg-white rounded-xl p-6 shadow-sm overflow-x-auto">
  <div style={{ width: `${gfMaterials.length * 90}px`, height: "500px" }}>
    <Line
      data={{
        labels: gfMaterials.map(m =>
          m.name.length > 12 ? m.name.slice(0, 12) + "..." : m.name
        ),
        datasets: [{
          label: "Material Quantity",
          data: gfMaterials.map(m => Math.max(m.quantity, 1)),  // prevent 0 issues
          borderColor: "#007bff",
          pointBackgroundColor: "#007bff",
          borderWidth: 2,
          pointRadius: 4,
          tension: 0.2
        }]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          y: {
            type: "logarithmic",
            min: 1,
            title: { display: true, text: "Quantity (Log Scale)" },
            ticks: {
              callback: (v) => Number(v).toLocaleString()
            }
          },
          x: {
            ticks: {
              maxRotation: 60,
              minRotation: 60
            }
          }
        },

        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              title: (ctx) => gfMaterials[ctx[0].dataIndex].name,
              label: (ctx) => {
                const m = gfMaterials[ctx.dataIndex];
                return `Qty: ${m.quantity.toLocaleString()}`;
              }
            }
          }
        }
      }}
    />
  </div>
</div>


  {/* Pie Chart */}
  {/* Pie Chart Block - Fixed Slices + Material Hover */}
<div className="bg-white rounded-xl p-6 shadow-sm">
  <div style={{ height: "450px", width: "700px" }}>
    {(() => {
      const CATEGORY_COLORS: Record<string, string> = {
        Environment: "#e63946",
        Miscellaneous: "#f4a261",
        Electrical: "#f1c40f",
        Hardware: "#2a9d8f",
        Foundation: "#264653",
        Mechanical: "#2ec4b6",
        Cables: "#00a6fb",
        Steel: "#003049",
        Estimate: "#4b32ff",
        Others: "#6d6875"
      };

      // Group materials (same as before)
      const grouped: Record<string, { total: number; items: string[] }> = {};

      gfMaterials.forEach((m: any) => {
        const raw = getMaterialGroup(m.name) || "Miscellaneous";
        const group =
          raw === "Electrical Equipment" ? "Electrical" :
          raw === "Hardware & Fittings" ? "Hardware" :
          raw === "Steel & Structure" ? "Steel" :
          raw === "Conductors & Wires" ? "Cables" :
          raw;

        if (!grouped[group]) grouped[group] = { total: 0, items: [] };
        grouped[group].items.push(m.name);
      });

      const labels = Object.keys(CATEGORY_COLORS);

      // 10 equal slices
      const data = labels.map(() => 1);

      return (
        <Doughnut
          data={{
            labels,
            datasets: [
              {
                data,
                backgroundColor: labels.map(l => CATEGORY_COLORS[l]),
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 10
              }
            ]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: { font: { size: 12 }, boxWidth: 16 }
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const label = labels[context.dataIndex];
                    const items = grouped[label]?.items || [];

                    return [
                      `${label}`,
                      "Materials:",
                      ...items.slice(0, 6),
                      items.length > 6 ? "...and more" : ""
                    ];
                  }
                }
              }
            }
          }}
        />
      );
    })()}
  </div>
</div>


</div>
        )}

        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${showFullLayout ? 'mb-6' : ''} print:p-2 print:mb-0 print:border print:border-slate-300 print:shadow-none print:rounded`}>
          <h4 className="text-lg font-bold text-slate-800 mb-4 print:text-[11px] print:mb-1 print:font-bold">📦 Material Requirements</h4>
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 print:px-1 print:py-[3px] print:text-[10px]">Material</th>
                  <th className="text-right px-4 py-3 text-sm font-bold text-slate-700 print:px-1 print:py-[3px] print:text-[10px]">Quantity</th>
                  <th className="text-right px-4 py-3 text-sm font-bold text-slate-700 print:px-1 print:py-[3px] print:text-[10px]">Total Cost</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {gfMaterials.map((material: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 print:px-1 print:py-[3px] print:text-[9px]">{material.name}</td>
                    <td className="px-4 py-3 text-sm text-right print:px-1 print:py-[3px] print:text-[9px]">
                      {material.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-slate-800 print:px-1 print:py-[3px] print:text-[9px]">
                      ₹{material.totalCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm text-right text-slate-700 print:px-1 print:py-[3px] print:text-[9px]">Subtotal:</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800 print:px-1 print:py-[3px] print:text-[9px]">
                    ₹{Number(generatedForecast.subtotal || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm text-right text-slate-700 print:px-1 print:py-[3px] print:text-[9px]">GST (18%):</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800 print:px-1 print:py-[3px] print:text-[9px]">
                    ₹{Number(generatedForecast.gst || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-blue-100 to-teal-100">
                  <td colSpan={3} className="px-4 py-3 text-base text-right text-slate-800 print:px-1 print:py-[3px] print:text-[10px] print:font-bold">Total Estimated Cost:</td>
                  <td className="px-4 py-3 text-lg text-right font-black text-blue-700 print:px-1 print:py-[3px] print:text-[10px]">
                    ₹{Number(generatedForecast.total || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        {showFullLayout && (
        <div className="text-center py-4 border-t border-slate-200 text-sm text-slate-500 print:block print:py-1 print:text-[8px] print:border-slate-300">
          <p>AI-Powered Forecast Report | POWERGRID | Confidence Level: {generatedForecast.confidence}%</p>
          <p className="mt-1 text-xs print:mt-0 print:text-[7px]">This forecast is generated using advanced machine learning algorithms based on historical data and project parameters.</p>
        </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="AI Demand Forecast">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>AI Forecast - POWERGRID</title>
      </Head>

      <DashboardLayout title="AI Demand Forecast">
        <div className="fade-in max-w-7xl">
          {/* Header with Stats - Hidden on Print */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-8 rounded-2xl shadow-lg text-white mb-6 print:hidden">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Material Demand Forecasting</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-teal-100 text-sm font-medium">Active Forecasts</p>
                <p className="text-3xl font-bold mt-1">{forecastStats.activeForecasts}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-teal-100 text-sm font-medium">Forecast Accuracy</p>
                <p className="text-3xl font-bold mt-1">{forecastStats.accuracy}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-teal-100 text-sm font-medium">Projects Tracked</p>
                <p className="text-3xl font-bold mt-1">{projects.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-teal-100 text-sm font-medium">Projected Shortages</p>
                <p className="text-3xl font-bold mt-1">{forecastStats.projectedShortages}</p>
              </div>
            </div>
          </div>

          {/* Tab Content Container */}
          <div className="p-8">
            <div className="flex flex-wrap gap-4 mb-6 print:hidden">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 rounded-2xl border-2 transition-all text-left flex-1 min-w-[200px] ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-teal-500 to-sky-500 text-white border-transparent shadow-lg shadow-teal-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-300 hover:text-slate-800'
                  }`}
                >
                  <span className="block text-sm font-semibold">{tab.label}</span>
                  <span className={`text-xs ${activeTab === tab.id ? 'text-slate-100' : 'text-slate-400'}`}>
                    {tab.description}
                  </span>
                </button>
              ))}
            </div>

            {/* New Forecast Tab - Hide on Print */}
            {activeTab === 'new-forecast' && (
              <div className="print:hidden">
                {generatedForecast ? (
                  renderForecastDetail('inline')
                ) : (
                  <>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Project Parameters</h3>
                    <button
                      onClick={() => setShowProjectSelect(!showProjectSelect)}
                      className="btn btn-outline text-sm"
                    >
                      📋 Load Existing Project
                    </button>
                  </div>

                  {/* Project Selection Card */}
                  {showProjectSelect && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-blue-500 text-white p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-slate-800 mb-3">Select Project to Auto-Fill Forecast</label>
                          <select
                            value={selectedProjectId}
                            onChange={(e) => {
                              setSelectedProjectId(e.target.value);
                              const project = projects.find(p => p.id === e.target.value);
                              if (project) {
                                setFormData({
                                  projectName: project.name,
                                  projectCategory: project.projectCategory || project.projectType || 'Transmission',
                                  budget: (project.budget / 10000000).toFixed(2),
                                  region: project.region || '',
                                  location: project.location || '',
                                  terrain: project.terrain || 'Mixed',
                                  startDate: project.startDate || '',
                                  endDate: project.endDate || '',
                                  lineLength: project.lineLength || '',
                                  distanceFromStorage: project.distanceFromStorage ? String(project.distanceFromStorage) : '',
                                  towerType: project.towerType || '',
                                  substationType: project.substationType || ''
                                });
                                if (project.towerType && project.substationType) {
                                  setProjectType('Both');
                                } else if (project.towerType) {
                                  setProjectType('Tower');
                                } else if (project.substationType) {
                                  setProjectType('Substation');
                                }
                              }
                            }}
                            className="w-full mb-3"
                          >
                            <option value="">-- Choose a project --</option>
                            {projects.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.id} - {p.name} ({p.completion}% complete)
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-blue-700">
                            <strong>🔗 Synchronized:</strong> Selecting a project will load all parameters
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Forecast Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.projectName}
                          onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                          placeholder="e.g., 765kV Transmission Line"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Project Category *</label>
                        <select
                          required
                          value={formData.projectCategory}
                          onChange={(e) => setFormData({...formData, projectCategory: e.target.value})}
                        >
                          <option value="Transmission">Transmission</option>
                          <option value="Substation">Substation</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Project Type *</label>
                        <select
                          required
                          value={projectType}
                          onChange={(e) => setProjectType(e.target.value)}
                        >
                          <option value="">Select Project Type</option>
                          <option value="Tower">Tower Type</option>
                          <option value="Substation">Substation Type</option>
                          <option value="Both">Both (Tower & Substation)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(projectType === 'Tower' || projectType === 'Both') && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Tower Type *</label>
                          <select
                            required={projectType === 'Tower' || projectType === 'Both'}
                            value={formData.towerType}
                            onChange={(e) => setFormData({...formData, towerType: e.target.value})}
                          >
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
                          <select
                            required={projectType === 'Substation' || projectType === 'Both'}
                            value={formData.substationType}
                            onChange={(e) => setFormData({...formData, substationType: e.target.value})}
                          >
                            <option value="">Select Type</option>
                            <option value="765kV GIS">765kV GIS</option>
                            <option value="400kV AIS">400kV AIS</option>
                            <option value="220kV Hybrid">220kV Hybrid</option>
                            <option value="132kV Standard">132kV Standard</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Budget (₹ Crores) *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        placeholder="e.g., 100"
                      />
                      <p className="text-xs text-slate-500 mt-1">Enter budget in Crores</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Region *</label>
                        <select
                          required
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value, location: ''})}
                        >
                          <option value="">Select Region</option>
                          {Object.keys(regionStates).map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">State/Location *</label>
                        <select
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          disabled={!formData.region}
                        >
                          <option value="">Select State</option>
                          {formData.region && regionStates[formData.region]?.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Terrain *</label>
                        <select
                          required
                          value={formData.terrain}
                          onChange={(e) => setFormData({...formData, terrain: e.target.value})}
                        >
                          <option value="Plains">Plains</option>
                          <option value="Coastal">Coastal</option>
                          <option value="Hilly">Hilly</option>
                          <option value="Desert">Desert</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">End Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Line Length (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.lineLength}
                          onChange={(e) => setFormData({...formData, lineLength: e.target.value})}
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Distance from Storage (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.distanceFromStorage}
                          onChange={(e) => setFormData({...formData, distanceFromStorage: e.target.value})}
                          placeholder="e.g., 75"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                      <button type="submit" className="btn btn-primary">
                        🤖 Generate AI Forecast
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            projectName: '',
                            projectCategory: 'Transmission',
                            budget: '',
                            region: '',
                            location: '',
                            terrain: 'Mixed',
                            startDate: '',
                            endDate: '',
                            lineLength: '',
                            distanceFromStorage: '',
                            towerType: '',
                            substationType: ''
                          });
                          setProjectType('');
                          setSelectedProjectId('');
                        }}
                        className="btn btn-secondary"
                      >
                        Reset Form
                      </button>
                    </div>
                  </form>
                  </>
                )}
              </div>
            )}

            {/* Forecast History Tab - Hide on Print */}
            {activeTab === 'forecast-history' && (
              <div className="print:hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Forecast History</h3>
                    <div className="text-sm text-slate-600">
                      Total Forecasts: <span className="font-bold text-teal-600">{forecasts.length}</span>
                    </div>
                  </div>
                  {forecasts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Project Name</th>
                            <th>Estimated Cost</th>
                            <th>Actual Cost</th>
                            <th>Accuracy</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {forecasts.map((f: any, idx: number) => (
                            <tr key={idx}>
                              <td className="font-medium text-slate-800">{f.projectName || 'Unknown'}</td>
                              <td className="font-bold text-purple-600">₹{f.estimatedCost?.toLocaleString('en-IN')}</td>
                              <td className="font-bold text-green-600">₹{f.actualCost?.toLocaleString('en-IN')}</td>
                              <td>
                                {f.accuracy ? (
                                  <span className={`badge font-bold ${f.accuracy >= 90 ? 'badge-success' : f.accuracy >= 75 ? 'badge-warning' : 'badge-danger'}`}>
                                    {f.accuracy.toFixed(1)}%
                                  </span>
                                ) : <span className="text-slate-400">-</span>}
                              </td>
                              <td>
                                <span className={`badge ${f.status === 'Verified' ? 'badge-success' : 'badge-warning'}`}>
                                  {f.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                      <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      <p className="text-lg font-semibold text-slate-600">No forecasts generated yet</p>
                      <p className="text-sm text-slate-500 mt-2">Create your first forecast to see predictions here</p>
                      <button
                        onClick={() => setActiveTab('new-forecast')}
                        className="mt-4 btn btn-primary"
                      >
                        Create New Forecast
                      </button>
                    </div>
                  )}
              </div>
            )}

            {/* Material Projections Tab */}
            {activeTab === 'material-forecast' && renderForecastDetail('tab')}
          </div>


        </div>
      </DashboardLayout>
    </>
  );
}
