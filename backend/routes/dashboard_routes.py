from fastapi import APIRouter
import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_stats():
    return {
        "totalProjects": 0,
        "activeProjects": 0,
        "criticalProjects": 0,
        "totalMaterials": 0,
        "lowStockItems": 0,
        "pendingOrders": 0,
        "recommendedPOs": 0,
        "monthlySpend": 0,
        "forecastAccuracy": 95,
        "systemStatus": "BackendReady",
        "totalBudget": 0,
        "totalSpend": 0,
        "lastUpdated": datetime.datetime.now().isoformat()
    }
