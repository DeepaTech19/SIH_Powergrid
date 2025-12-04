// Material Master Data
export const materialMasterData = [
  { id: 'MAT001', name: 'Steel Towers (Type A - 765kV)', category: 'Towers', unit: 'Units', costPerUnit: 850000, leadTimeDays: 45, reorderLevel: 50, safetyStock: 30, supplier: 'SUP001' },
  { id: 'MAT002', name: 'Steel Towers (Type B - 400kV)', category: 'Towers', unit: 'Units', costPerUnit: 520000, leadTimeDays: 40, reorderLevel: 40, safetyStock: 25, supplier: 'SUP001' },
  { id: 'MAT003', name: 'Steel Towers (Type C - 220kV)', category: 'Towers', unit: 'Units', costPerUnit: 320000, leadTimeDays: 35, reorderLevel: 35, safetyStock: 20, supplier: 'SUP001' },
  { id: 'MAT004', name: 'Conductors - ACSR 400mm', category: 'Conductors', unit: 'Meters', costPerUnit: 450, leadTimeDays: 30, reorderLevel: 5000, safetyStock: 3000, supplier: 'SUP002' },
  { id: 'MAT005', name: 'Conductors - ACSR 300mm', category: 'Conductors', unit: 'Meters', costPerUnit: 350, leadTimeDays: 30, reorderLevel: 4000, safetyStock: 2500, supplier: 'SUP002' },
  { id: 'MAT006', name: 'Insulators - Disc Type', category: 'Insulators', unit: 'Units', costPerUnit: 1200, leadTimeDays: 25, reorderLevel: 1000, safetyStock: 600, supplier: 'SUP003' },
  { id: 'MAT007', name: 'Insulators - Polymer Type', category: 'Insulators', unit: 'Units', costPerUnit: 1500, leadTimeDays: 28, reorderLevel: 800, safetyStock: 500, supplier: 'SUP003' },
  { id: 'MAT008', name: 'Circuit Breakers 765kV', category: 'Equipment', unit: 'Units', costPerUnit: 1250000, leadTimeDays: 90, reorderLevel: 5, safetyStock: 3, supplier: 'SUP004' },
  { id: 'MAT009', name: 'Circuit Breakers 400kV', category: 'Equipment', unit: 'Units', costPerUnit: 750000, leadTimeDays: 75, reorderLevel: 8, safetyStock: 5, supplier: 'SUP004' },
  { id: 'MAT010', name: 'Transformers 765/400kV', category: 'Equipment', unit: 'Units', costPerUnit: 8500000, leadTimeDays: 120, reorderLevel: 3, safetyStock: 2, supplier: 'SUP005' },
  { id: 'MAT011', name: 'Transformers 400/220kV', category: 'Equipment', unit: 'Units', costPerUnit: 5200000, leadTimeDays: 100, reorderLevel: 4, safetyStock: 2, supplier: 'SUP005' },
  { id: 'MAT012', name: 'Foundation Bolts M36', category: 'Hardware', unit: 'Units', costPerUnit: 850, leadTimeDays: 15, reorderLevel: 5000, safetyStock: 3000, supplier: 'SUP006' },
  { id: 'MAT013', name: 'Earth Wire ACSR', category: 'Conductors', unit: 'Meters', costPerUnit: 180, leadTimeDays: 25, reorderLevel: 3000, safetyStock: 2000, supplier: 'SUP002' },
  { id: 'MAT014', name: 'Spacers & Dampers', category: 'Hardware', unit: 'Sets', costPerUnit: 2500, leadTimeDays: 20, reorderLevel: 500, safetyStock: 300, supplier: 'SUP006' }
];

// Supplier Master Data
export const suppliersData = [
  { id: 'SUP001', name: 'Tata Steel', category: 'Towers', rating: 4.8, onTimeDelivery: 95, qualityScore: 98, avgLeadTime: 40, contactEmail: 'orders@tatasteel.com', contactPhone: '+91-22-6665-8282' },
  { id: 'SUP002', name: 'Sterlite Power', category: 'Conductors', rating: 4.7, onTimeDelivery: 92, qualityScore: 96, avgLeadTime: 28, contactEmail: 'sales@sterlitepower.com', contactPhone: '+91-20-3082-4500' },
  { id: 'SUP003', name: 'NGK Insulators', category: 'Insulators', rating: 4.9, onTimeDelivery: 97, qualityScore: 99, avgLeadTime: 26, contactEmail: 'india@ngk.com', contactPhone: '+91-44-4299-6200' },
  { id: 'SUP004', name: 'Siemens India', category: 'Equipment', rating: 4.8, onTimeDelivery: 94, qualityScore: 98, avgLeadTime: 80, contactEmail: 'energy@siemens.com', contactPhone: '+91-22-3967-7000' },
  { id: 'SUP005', name: 'ABB India', category: 'Equipment', rating: 4.9, onTimeDelivery: 96, qualityScore: 99, avgLeadTime: 110, contactEmail: 'transformers@abb.com', contactPhone: '+91-80-2294-9150' },
  { id: 'SUP006', name: 'L&T Construction', category: 'Hardware', rating: 4.6, onTimeDelivery: 90, qualityScore: 95, avgLeadTime: 18, contactEmail: 'procurement@lntecc.com', contactPhone: '+91-44-2254-6122' }
];

// Current Inventory Levels
export const inventoryData = [
  { materialId: 'MAT001', currentStock: 45, reserved: 20, available: 25, inTransit: 30, lastUpdated: '2025-11-27' },
  { materialId: 'MAT002', currentStock: 52, reserved: 15, available: 37, inTransit: 0, lastUpdated: '2025-11-27' },
  { materialId: 'MAT003', currentStock: 38, reserved: 10, available: 28, inTransit: 20, lastUpdated: '2025-11-26' },
  { materialId: 'MAT004', currentStock: 12000, reserved: 5000, available: 7000, inTransit: 8000, lastUpdated: '2025-11-27' },
  { materialId: 'MAT005', currentStock: 8500, reserved: 3000, available: 5500, inTransit: 0, lastUpdated: '2025-11-26' },
  { materialId: 'MAT006', currentStock: 850, reserved: 400, available: 450, inTransit: 500, lastUpdated: '2025-11-27' },
  { materialId: 'MAT007', currentStock: 920, reserved: 300, available: 620, inTransit: 0, lastUpdated: '2025-11-25' },
  { materialId: 'MAT008', currentStock: 4, reserved: 2, available: 2, inTransit: 3, lastUpdated: '2025-11-27' },
  { materialId: 'MAT009', currentStock: 11, reserved: 3, available: 8, inTransit: 0, lastUpdated: '2025-11-26' },
  { materialId: 'MAT010', currentStock: 2, reserved: 1, available: 1, inTransit: 2, lastUpdated: '2025-11-27' },
  { materialId: 'MAT011', currentStock: 5, reserved: 2, available: 3, inTransit: 0, lastUpdated: '2025-11-25' },
  { materialId: 'MAT012', currentStock: 6200, reserved: 2000, available: 4200, inTransit: 0, lastUpdated: '2025-11-26' },
  { materialId: 'MAT013', currentStock: 4500, reserved: 1500, available: 3000, inTransit: 2000, lastUpdated: '2025-11-27' },
  { materialId: 'MAT014', currentStock: 580, reserved: 150, available: 430, inTransit: 0, lastUpdated: '2025-11-24' }
];

// Projects Data
export const projectsData = [
  { 
    id: 'PRJ001', name: '765kV Transmission Line - Mumbai-Pune', region: 'West', location: 'Maharashtra', 
    budget: 125000000, status: 'In Progress', completion: 65, priority: 'High',
    projectType: 'Both', towerType: 'Type A - 765kV', substationType: '765kV GIS', lineLength: 280, 
    startDate: '2024-03-15', endDate: '2026-06-30',
    materialRequirements: [
      { materialId: 'MAT001', quantity: 42, allocated: 30, pending: 12 },
      { materialId: 'MAT004', quantity: 28000, allocated: 20000, pending: 8000 },
      { materialId: 'MAT006', quantity: 1260, allocated: 850, pending: 410 },
      { materialId: 'MAT008', quantity: 12, allocated: 8, pending: 4 },
      { materialId: 'MAT010', quantity: 6, allocated: 4, pending: 2 }
    ],
    towerLocations: [{lat: 19.0760, lng: 72.8777}, {lat: 18.5204, lng: 73.8567}], 
    substationLocations: [{lat: 19.0760, lng: 72.8777}, {lat: 18.5204, lng: 73.8567}]
  },
  { 
    id: 'PRJ002', name: '400kV Substation - Delhi NCR', region: 'North', location: 'Delhi NCR', 
    budget: 89000000, status: 'In Progress', completion: 42, priority: 'Medium',
    projectType: 'Both', towerType: 'Type B - 400kV', substationType: '400kV AIS', lineLength: 120, 
    startDate: '2024-06-01', endDate: '2025-12-31',
    materialRequirements: [
      { materialId: 'MAT002', quantity: 28, allocated: 18, pending: 10 },
      { materialId: 'MAT005', quantity: 12000, allocated: 8000, pending: 4000 },
      { materialId: 'MAT007', quantity: 840, allocated: 560, pending: 280 },
      { materialId: 'MAT009', quantity: 8, allocated: 6, pending: 2 },
      { materialId: 'MAT011', quantity: 4, allocated: 2, pending: 2 }
    ],
    towerLocations: [{lat: 28.7041, lng: 77.1025}], 
    substationLocations: [{lat: 28.7041, lng: 77.1025}]
  },
  { 
    id: 'PRJ003', name: '220kV Grid Extension - Bangalore', region: 'South', location: 'Karnataka', 
    budget: 67000000, status: 'Planning', completion: 15, priority: 'Low',
    projectType: 'Both', towerType: 'Type C - 220kV', substationType: '220kV Hybrid', lineLength: 185, 
    startDate: '2025-01-10', endDate: '2026-08-20',
    materialRequirements: [
      { materialId: 'MAT003', quantity: 35, allocated: 10, pending: 25 },
      { materialId: 'MAT005', quantity: 18500, allocated: 5000, pending: 13500 },
      { materialId: 'MAT006', quantity: 1050, allocated: 300, pending: 750 },
      { materialId: 'MAT009', quantity: 6, allocated: 2, pending: 4 },
      { materialId: 'MAT011', quantity: 3, allocated: 0, pending: 3 }
    ],
    towerLocations: [{lat: 12.9716, lng: 77.5946}], 
    substationLocations: [{lat: 12.9716, lng: 77.5946}]
  },
  { 
    id: 'PRJ004', name: '765kV HVDC Link - Chennai-Hyderabad', region: 'South', location: 'Tamil Nadu', 
    budget: 153000000, status: 'In Progress', completion: 78, priority: 'Critical',
    projectType: 'Both', towerType: 'Type A - 765kV', substationType: '765kV GIS', lineLength: 625, 
    startDate: '2023-09-01', endDate: '2025-11-30',
    materialRequirements: [
      { materialId: 'MAT001', quantity: 75, allocated: 68, pending: 7 },
      { materialId: 'MAT004', quantity: 62500, allocated: 58000, pending: 4500 },
      { materialId: 'MAT006', quantity: 2250, allocated: 2100, pending: 150 },
      { materialId: 'MAT008', quantity: 18, allocated: 16, pending: 2 },
      { materialId: 'MAT010', quantity: 9, allocated: 8, pending: 1 }
    ],
    towerLocations: [{lat: 13.0827, lng: 80.2707}, {lat: 17.3850, lng: 78.4867}], 
    substationLocations: [{lat: 13.0827, lng: 80.2707}, {lat: 17.3850, lng: 78.4867}]
  }
];

// Demand Forecasts
export const forecastsData = [
  { id: 'FC001', projectId: 'PRJ001', materialId: 'MAT001', month: '2025-06', forecastedQty: 25, actualQty: 24, confidence: 94, accuracy: 96 },
  { id: 'FC002', projectId: 'PRJ001', materialId: 'MAT004', month: '2025-07', forecastedQty: 15000, actualQty: 14800, confidence: 92, accuracy: 98.7 },
  { id: 'FC003', projectId: 'PRJ002', materialId: 'MAT002', month: '2025-08', forecastedQty: 18, actualQty: 17, confidence: 89, accuracy: 94.4 },
  { id: 'FC004', projectId: 'PRJ004', materialId: 'MAT001', month: '2025-09', forecastedQty: 12, actualQty: 13, confidence: 96, accuracy: 91.7 },
  { id: 'FC005', projectId: 'PRJ001', materialId: 'MAT001', month: '2025-10', forecastedQty: 27, actualQty: 26, confidence: 93, accuracy: 96.3 },
  { id: 'FC006', projectId: 'PRJ003', materialId: 'MAT003', month: '2025-11', forecastedQty: 35, actualQty: 34, confidence: 88, accuracy: 97.1 },
  { id: 'FC007', projectId: 'PRJ001', materialId: 'MAT001', month: '2025-12', forecastedQty: 28, actualQty: null, confidence: 94 },
  { id: 'FC008', projectId: 'PRJ002', materialId: 'MAT004', month: '2026-01', forecastedQty: 16000, actualQty: null, confidence: 91 }
];

// Procurement Orders
export const procurementData = [
  { id: 'PO001', materialId: 'MAT001', supplierId: 'SUP001', quantity: 50, unitCost: 850000, totalCost: 42500000, orderDate: '2025-11-15', expectedDate: '2025-12-30', actualDate: null, status: 'Pending', projectId: 'PRJ001', triggerReason: 'Low Stock Alert' },
  { id: 'PO002', materialId: 'MAT004', supplierId: 'SUP002', quantity: 20000, unitCost: 450, totalCost: 9000000, orderDate: '2025-11-18', expectedDate: '2025-12-18', actualDate: null, status: 'In Transit', projectId: 'PRJ001', triggerReason: 'Forecast Demand' },
  { id: 'PO003', materialId: 'MAT010', supplierId: 'SUP005', quantity: 3, unitCost: 8500000, totalCost: 25500000, orderDate: '2025-11-10', expectedDate: '2026-03-10', actualDate: null, status: 'In Transit', projectId: 'PRJ001', triggerReason: 'Project Requirement' },
  { id: 'PO004', materialId: 'MAT006', supplierId: 'SUP003', quantity: 1500, unitCost: 1200, totalCost: 1800000, orderDate: '2025-11-20', expectedDate: '2025-12-15', actualDate: null, status: 'Pending', projectId: 'PRJ002', triggerReason: 'Safety Stock' },
  { id: 'PO005', materialId: 'MAT002', supplierId: 'SUP001', quantity: 40, unitCost: 520000, totalCost: 20800000, orderDate: '2025-11-22', expectedDate: '2026-01-06', actualDate: null, status: 'Approved', projectId: 'PRJ002', triggerReason: 'Forecast Demand' }
];
