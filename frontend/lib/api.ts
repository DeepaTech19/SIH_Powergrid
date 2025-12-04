// File: lib/api.ts
// Centralized frontend API wrapper — uses backend when available, falls back to in-memory for non-critical endpoints.

import {
  materialMasterData as localMaterialMasterData,
  suppliersData as localSuppliersData,
  inventoryData as localInventoryData,
  projectsData as localProjectsData,
  forecastsData as localForecastsData,
  procurementData as localProcurementData,
} from './data';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

function safeJsonParse(raw: any) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function fetchJson(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json();
}

class API {
  // primary endpoints - try backend, fallback to local memory data
  async getDashboardStats() {
    try {
      return await fetchJson(`${BASE_URL}/dashboard/stats`);
    } catch {
      // fallback computed stats from local arrays
      const atRiskMaterials = localInventoryData.filter(inv => inv.alertLevel === 'critical' || inv.alertLevel === 'warning').length;
      const criticalProjects = localProjectsData.filter(p => p.status === 'In Progress' && (p.completion ?? 100) < 70).length;
      const monthlySpend = localProcurementData.reduce((s, p) => s + (p.totalCost || 0), 0);
      return {
        totalProjects: localProjectsData.length,
        activeProjects: localProjectsData.filter(p => p.status === 'In Progress').length,
        criticalProjects,
        totalMaterials: localMaterialMasterData.length,
        lowStockItems: atRiskMaterials,
        pendingOrders: localProcurementData.filter(po => po.status === 'Pending' || po.status === 'Approved').length,
        recommendedPOs: 0,
        monthlySpend,
        forecastAccuracy: 94.5,
        systemStatus: 'LocalFallback',
        totalBudget: localProjectsData.reduce((s, p) => s + (p.budget || 0), 0),
        totalSpend: monthlySpend,
        lastUpdated: new Date().toLocaleString(),
      };
    }
  }

  async getMaterialsSummary() {
    try {
      return await fetchJson(`${BASE_URL}/materials/summary`);
    } catch {
      return localMaterialMasterData.map(m => {
        const inventory = localInventoryData.find(inv => inv.materialId === m.id) || {};
        return { ...m, ...inventory };
      });
    }
  }

  async getProjectsSummary(userId?: number) {
    try {
      // if no userId passed, backend might return all
      const uid = userId ?? '';
      const url = uid ? `${BASE_URL}/projects/user/${uid}` : `${BASE_URL}/projects`;
      return await fetchJson(url);
    } catch {
      return localProjectsData.map(p => ({ ...p, fulfillment: 100 }));
    }
  }

  async getProjectById(id: string) {
    try {
      return await fetchJson(`${BASE_URL}/projects/${id}`);
    } catch {
      const p = localProjectsData.find(x => x.id === id);
      return p ?? null;
    }
  }

  async createProject(projectData: any) {
    // frontend expects created project back with id
    try {
      const payload = {
        ...projectData,
        user_id: projectData.user_id ?? projectData.userId ?? 1,
      };
      return await fetchJson(`${BASE_URL}/projects/create`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // fallback to local create
      const newProject = {
        id: `PRJ${String(localProjectsData.length + 1).padStart(3, '0')}`,
        ...projectData,
        status: 'Planning',
        completion: 0,
      };
      localProjectsData.push(newProject);
      return newProject;
    }
  }

  async saveForecastAndPredict(formPayload: any) {
    try {
      const payload = {
        project_category_main: formPayload.projectCategory,
        project_type: formPayload.projectType,
        project_budget_price_in_lake: formPayload.budget,
        state: formPayload.location,
        terrain: formPayload.terrain,
        distance_from_storage_unit: formPayload.distanceFromStorage, // <-- correct
        transmission_line_length_km: formPayload.lineLength || 100,
        location: formPayload.location,
        project_name: formPayload.projectName,
      };

      const res = await fetchJson(`${BASE_URL}/forecast/save`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return res;
    } catch (err) {
      console.error("Error in saveForecastAndPredict:", err);
      throw err;
    }
  }

  async getForecasts(filters: any = {}) {
    try {
      const url = new URL(`${BASE_URL}/forecast/history`);
      Object.keys(filters || {}).forEach(k => url.searchParams.set(k, String(filters[k])));
      return await fetchJson(url.toString());
    } catch {
      return localForecastsData;
    }
  }

  async getProcurementOrders() {
    try {
      return await fetchJson(`${BASE_URL}/procurement`);
    } catch {
      return localProcurementData;
    }
  }

  async getSuppliers() {
    try {
      return await fetchJson(`${BASE_URL}/suppliers`);
    } catch {
      return localSuppliersData;
    }
  }

  async addBackendCreateProject(projectData: any) {
    try {
      return await fetchJson(`${BASE_URL}/projects/create`, {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    } catch (err) {
      console.error('Backend project creation failed:', err);
      throw err;
    }
  }

  async addBackendPredictForecast(formData: any) {
    try {
      const response = await fetch(`${BASE_URL}/forecast/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const txt = await response.text().catch(() => null);
        throw new Error(txt || `Forecast API returned ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Backend forecast prediction failed:', err);
      throw err;
    }
  }

  async addBackendSaveForecast(projectId: string, userInputs: any, predictions: any) {
    try {
      return await fetchJson(`${BASE_URL}/forecast/save`, {
        method: 'POST',
        body: JSON.stringify({
          project_id: projectId,
          user_inputs: userInputs,
          predictions: predictions,
        }),
      });
    } catch (err) {
      console.error('Backend forecast save failed:', err);
      throw err;
    }
  }
    calculateForecastAccuracy() {
    try {
      // backend may support it later
      return 95; // static accuracy, safe fallback
    } catch {
      return 95;
    }
  }
  async generateForecast(formData: any) {
  try {
    // Convert UI form into backend format
    const payload = {
      project_category_main: formData.projectCategory,
      project_type: formData.projectType,
      project_budget_price_in_lake: formData.budget, 
      state: formData.location,
      terrain: formData.terrain,
      distance_from_storage_unit: formData.distanceFromStorage,
      transmission_line_length_km: formData.lineLength || 100,
      location: formData.location,
      project_name: formData.projectName,
    };

    // Call backend /forecast/save
    const response = await fetch(`${BASE_URL}/forecast/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(txt || "Forecast generation failed");
    }

    return await response.json();
  } catch (err) {
    console.error("generateForecast Error:", err);
    throw err;
  }
}


}

export const api = new API();
