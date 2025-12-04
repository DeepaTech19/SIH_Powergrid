import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { materialMasterData } from '../../lib/data';

export default function Procurement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [orders, setOrders] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Recommendations
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

  // Create PO Form
  const [newPO, setNewPO] = useState({
    materialId: '',
    quantity: '',
    supplierId: '',
    deliveryDate: '',
    priority: 'Medium'
  });

  useEffect(() => {
    loadProcurementData();
  }, []);

  const loadProcurementData = async () => {
    try {
      const [ordersData, materialsData] = await Promise.all([
        api.getProcurementOrders(),
        api.getMaterialsSummary()
      ]);
      
      setOrders(ordersData);
      setMaterials(materialsData);
      
      // Mock suppliers
      setSuppliers([
        { id: 'SUP001', name: 'ABC Suppliers Ltd', category: 'Conductors', rating: 4.8, onTimeDelivery: 94, qualityScore: 96, avgLeadTime: 25 },
        { id: 'SUP002', name: 'Power Components Inc', category: 'Towers', rating: 4.5, onTimeDelivery: 88, qualityScore: 92, avgLeadTime: 35 },
        { id: 'SUP003', name: 'GridTech Solutions', category: 'Insulators', rating: 4.7, onTimeDelivery: 92, qualityScore: 95, avgLeadTime: 28 },
        { id: 'SUP004', name: 'Transmission Equipment Co', category: 'Equipment', rating: 4.6, onTimeDelivery: 90, qualityScore: 93, avgLeadTime: 30 }
      ]);

      // Generate AI Recommendations
      const criticalMaterials = materialsData.filter((m: any) => m.status === 'Critical' || m.status === 'Low');
      const recommendations = criticalMaterials.map((m: any, idx: number) => {
        const recommendedSupplier = ['ABC Suppliers Ltd', 'GridTech Solutions', 'Power Components Inc'][idx % 3];
        const urgency = m.status === 'Critical' ? 'Critical' : 'High';
        const estimatedShortfall = Math.ceil(m.requiredQty - m.currentStock);
        return {
          id: `REC${String(idx + 1).padStart(3, '0')}`,
          materialName: m.name,
          materialId: m.id,
          currentStock: m.currentStock,
          requiredStock: m.requiredQty,
          shortfall: estimatedShortfall,
          recommendedQty: estimatedShortfall + Math.ceil(estimatedShortfall * 0.2),
          recommendedSupplier,
          estimatedCost: (estimatedShortfall + Math.ceil(estimatedShortfall * 0.2)) * m.costPerUnit,
          urgency,
          reason: urgency === 'Critical' 
            ? `Stock critically low. Immediate procurement required to avoid project delays.`
            : `Stock below minimum threshold. Recommend procurement to maintain buffer.`,
          impact: urgency === 'Critical'
            ? `Potential delay of ${Math.ceil(Math.random() * 3) + 1} project(s) if not addressed within 48 hours.`
            : `May affect upcoming project timelines if not procured within 7 days.`,
          deliveryTime: Math.ceil(Math.random() * 20) + 15
        };
      });
      setAiRecommendations(recommendations);

    } catch (error) {
      console.error('Failed to load procurement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecommendation = (rec: any) => {
    alert(`Approved recommendation for ${rec.materialName}. Creating PO...`);
    setAiRecommendations(aiRecommendations.filter(r => r.id !== rec.id));
  };

  const handleModifyRecommendation = (rec: any) => {
    setNewPO({
      materialId: rec.materialId,
      quantity: rec.recommendedQty.toString(),
      supplierId: suppliers.find(s => s.name === rec.recommendedSupplier)?.id || '',
      deliveryDate: new Date(Date.now() + rec.deliveryTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: rec.urgency === 'Critical' ? 'High' : 'Medium'
    });
    setActiveTab('create');
  };

  const handleDismissRecommendation = (rec: any) => {
    if (confirm(`Are you sure you want to dismiss this recommendation for ${rec.materialName}?`)) {
      setAiRecommendations(aiRecommendations.filter(r => r.id !== rec.id));
    }
  };

  const handleCreatePO = () => {
    const material = materialMasterData.find((m: any) => m.id === newPO.materialId);
    const supplier = suppliers.find((s: any) => s.id === newPO.supplierId);
    
    if (!material || !supplier || !newPO.quantity || !newPO.deliveryDate) {
      alert('Please fill all required fields');
      return;
    }

    const totalValue = parseFloat(newPO.quantity) * material.costPerUnit;
    alert(`Purchase Order created!\n\nMaterial: ${material.name}\nQuantity: ${newPO.quantity}\nSupplier: ${supplier.name}\nTotal Value: ₹${totalValue.toLocaleString()}\nExpected Delivery: ${newPO.deliveryDate}`);
    
    setNewPO({ materialId: '', quantity: '', supplierId: '', deliveryDate: '', priority: 'Medium' });
    setActiveTab('active');
  };

  if (loading) {
    return (
      <DashboardLayout title="Procurement Control">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const activeOrders = orders.filter(o => o.status === 'In Transit');
  const pendingApproval = orders.filter(o => o.status === 'Pending');
  const totalValue = orders.reduce((sum, o) => sum + o.totalValue, 0);
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const avgDelivery = deliveredOrders.length > 0
    ? Math.round(deliveredOrders.reduce((sum, o) => sum + (o.deliveryDays || 30), 0) / deliveredOrders.length)
    : 30;

  return (
    <>
      <Head>
        <title>Procurement - POWERGRID</title>
      </Head>

      <DashboardLayout title="Procurement Control Center">
        <div className="fade-in">
          {/* Header Stats */}
          <div className="bg-gradient-to-r from-blue-500 to-teal-600 p-8 rounded-2xl shadow-lg text-white mb-6">
            <h2 className="text-3xl font-bold mb-6">🛒 Procurement Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">Active POs</p>
                <p className="text-3xl font-black">{activeOrders.length}</p>
              </div>
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4 border-2 border-yellow-300">
                <p className="text-sm text-yellow-100 mb-1">Pending Approval</p>
                <p className="text-3xl font-black">{pendingApproval.length}</p>
              </div>
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-4 border-2 border-orange-300">
                <p className="text-sm text-orange-100 mb-1">AI Recommendations</p>
                <p className="text-3xl font-black">{aiRecommendations.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">Total Value</p>
                <p className="text-3xl font-black">₹{(totalValue / 10000000).toFixed(1)}Cr</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">Avg Delivery Time</p>
                <p className="text-3xl font-black">{avgDelivery} days</p>
              </div>
            </div>
          </div>

          {/* AI Recommendations Alert */}
          {aiRecommendations.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-orange-500 text-white p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-orange-900 mb-2">🤖 AI-Powered Procurement Recommendations</h3>
                  <p className="text-orange-800 mb-3">Our AI system has identified <strong>{aiRecommendations.length}</strong> procurement opportunities based on current inventory levels and project forecasts.</p>
                  <button onClick={() => setActiveTab('recommendations')} className="btn btn-primary text-sm">
                    Review Recommendations
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="border-b border-slate-200 flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-6 py-4 font-semibold transition-all relative ${
                  activeTab === 'recommendations'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                🤖 AI Recommendations
                {aiRecommendations.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {aiRecommendations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'active'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                📦 Active POs ({activeOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'create'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ✨ Create New PO
              </button>
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'suppliers'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                🏭 Supplier Scorecards
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'text-slate-600 border-b-2 border-slate-600 bg-slate-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                📜 PO History
              </button>
            </div>

            <div className="p-6">
              {/* AI Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">AI-Generated Procurement Recommendations</h3>
                    <p className="text-sm text-slate-600">Based on current inventory levels, project forecasts, and supplier performance data</p>
                  </div>

                  {aiRecommendations.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-xl font-bold text-slate-700 mb-2">All Clear!</h3>
                      <p className="text-slate-600">No urgent procurement recommendations at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiRecommendations.map(rec => (
                        <div key={rec.id} className={`border-2 rounded-lg p-6 ${
                          rec.urgency === 'Critical' ? 'border-red-300 bg-red-50' :
                          rec.urgency === 'High' ? 'border-orange-300 bg-orange-50' :
                          'border-yellow-300 bg-yellow-50'
                        }`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-slate-800">{rec.materialName}</h4>
                                <span className={`badge ${
                                  rec.urgency === 'Critical' ? 'badge-error' :
                                  rec.urgency === 'High' ? 'badge-warning' :
                                  'badge-info'
                                }`}>
                                  {rec.urgency} Priority
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">ID: {rec.id} • Recommended Supplier: <strong>{rec.recommendedSupplier}</strong></p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-slate-800">₹{(rec.estimatedCost / 100000).toFixed(2)}L</p>
                              <p className="text-xs text-slate-600">Estimated Cost</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-300">
                            <div>
                              <p className="text-xs text-slate-600 mb-1">Current Stock</p>
                              <p className="text-lg font-bold text-red-600">{rec.currentStock.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">Required Stock</p>
                              <p className="text-lg font-bold text-slate-800">{Number(rec.requiredStock ?? 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">Recommended Qty</p>
                              <p className="text-lg font-bold text-green-600">{rec.recommendedQty.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">Est. Delivery</p>
                              <p className="text-lg font-bold text-blue-600">{rec.deliveryTime} days</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-800 mb-1">📋 Reason:</p>
                            <p className="text-sm text-slate-700 mb-3">{rec.reason}</p>
                            <p className="text-sm font-semibold text-slate-800 mb-1">⚡ Business Impact:</p>
                            <p className="text-sm text-slate-700">{rec.impact}</p>
                          </div>

                          <div className="flex gap-3">
                            <button onClick={() => handleApproveRecommendation(rec)} className="btn btn-primary flex-1">
                              ✅ Approve & Create PO
                            </button>
                            <button onClick={() => handleModifyRecommendation(rec)} className="btn btn-outline flex-1">
                              ✏️ Modify & Review
                            </button>
                            <button onClick={() => handleDismissRecommendation(rec)} className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50">
                              ❌ Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active POs Tab */}
              {activeTab === 'active' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Active Purchase Orders</h3>
                    <p className="text-sm text-slate-600">Track current procurement orders and delivery status</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Material</th>
                          <th>Supplier</th>
                          <th>Quantity</th>
                          <th>Value</th>
                          <th>Order Date</th>
                          <th>Expected Delivery</th>
                          <th>Days Remaining</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrders.map(order => {
                          const daysRemaining = Math.ceil((new Date(order.expectedDelivery).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return (
                            <tr key={order.id}>
                              <td className="font-bold text-slate-800">{order.id}</td>
                              <td>{order.materialName}</td>
                              <td>{order.supplier}</td>
                              <td>{order.quantity.toLocaleString()}</td>
                              <td className="font-bold">₹{(order.totalValue / 100000).toFixed(2)}L</td>
                              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                              <td>{new Date(order.expectedDelivery).toLocaleDateString()}</td>
                              <td>
                                <span className={`font-bold ${daysRemaining < 5 ? 'text-red-600' : 'text-slate-600'}`}>
                                  {daysRemaining} days
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  order.status === 'Delivered' ? 'badge-success' :
                                  order.status === 'In Transit' ? 'badge-info' :
                                  'badge-warning'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Create PO Tab */}
              {activeTab === 'create' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Create New Purchase Order</h3>
                    <p className="text-sm text-slate-600">Fill in the details to create a new procurement order</p>
                  </div>

                  <div className="max-w-2xl bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Material</label>
                        <select
                          value={newPO.materialId}
                          onChange={(e) => setNewPO({ ...newPO, materialId: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Material</option>
                          {materialMasterData.map((m: any) => (
                            <option key={m.id} value={m.id}>{m.name} - ID: {m.id}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          value={newPO.quantity}
                          onChange={(e) => setNewPO({ ...newPO, quantity: e.target.value })}
                          placeholder="Enter quantity"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Supplier</label>
                        <select
                          value={newPO.supplierId}
                          onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Supplier</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name} - Rating: {s.rating}⭐ ({s.category})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Delivery Date</label>
                        <input
                          type="date"
                          value={newPO.deliveryDate}
                          onChange={(e) => setNewPO({ ...newPO, deliveryDate: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                        <select
                          value={newPO.priority}
                          onChange={(e) => setNewPO({ ...newPO, priority: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      {newPO.materialId && newPO.quantity && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800 mb-2">Estimated Order Value:</p>
                          <p className="text-2xl font-black text-blue-700">
                            ₹{((parseFloat(newPO.quantity) * (materialMasterData.find((m: any) => m.id === newPO.materialId)?.costPerUnit || 0)) / 100000).toFixed(2)}L
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button onClick={handleCreatePO} className="btn btn-primary flex-1">
                          Create Purchase Order
                        </button>
                        <button onClick={() => setNewPO({ materialId: '', quantity: '', supplierId: '', deliveryDate: '', priority: 'Medium' })} className="btn btn-outline">
                          Clear Form
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Supplier Scorecards Tab */}
              {activeTab === 'suppliers' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Supplier Performance Scorecards</h3>
                    <p className="text-sm text-slate-600">Comprehensive supplier ratings and performance metrics</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suppliers.map(supplier => {
                      const overallScore = ((supplier.rating / 5 * 100) + supplier.onTimeDelivery + supplier.qualityScore) / 3;
                      return (
                        <div key={supplier.id} className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-slate-800">{supplier.name}</h4>
                              <p className="text-sm text-slate-600">{supplier.category} • ID: {supplier.id}</p>
                            </div>
                            <div className="text-right">
                              <span className={`badge ${
                                overallScore >= 90 ? 'badge-success' :
                                overallScore >= 75 ? 'badge-info' :
                                'badge-warning'
                              } text-lg px-3 py-1`}>
                                {overallScore.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-600">Rating</span>
                                <span className="text-sm font-bold text-yellow-600">⭐ {supplier.rating} / 5.0</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(supplier.rating / 5) * 100}%` }}></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-600">On-Time Delivery</span>
                                <span className="text-sm font-bold text-green-600">{supplier.onTimeDelivery}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${supplier.onTimeDelivery}%` }}></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-600">Quality Score</span>
                                <span className="text-sm font-bold text-blue-600">{supplier.qualityScore}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${supplier.qualityScore}%` }}></div>
                              </div>
                            </div>

                            <div className="flex justify-between pt-2 border-t border-slate-200">
                              <span className="text-sm text-slate-600">Avg Lead Time</span>
                              <span className="text-sm font-bold text-slate-800">{supplier.avgLeadTime} days</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PO History Tab */}
              {activeTab === 'history' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Purchase Order History</h3>
                    <p className="text-sm text-slate-600">Complete history of all procurement orders</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Material</th>
                          <th>Supplier</th>
                          <th>Quantity</th>
                          <th>Value</th>
                          <th>Order Date</th>
                          <th>Delivery Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td className="font-bold text-slate-800">{order.id}</td>
                            <td>{order.materialName}</td>
                            <td>{order.supplier}</td>
                            <td>{order.quantity.toLocaleString()}</td>
                            <td className="font-bold">₹{(order.totalValue / 100000).toFixed(2)}L</td>
                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                            <td>{new Date(order.expectedDelivery).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${
                                order.status === 'Delivered' ? 'badge-success' :
                                order.status === 'In Transit' ? 'badge-info' :
                                order.status === 'Pending' ? 'badge-warning' :
                                'badge-error'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
