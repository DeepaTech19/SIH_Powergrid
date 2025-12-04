# routes/forecast.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Forecast, ForecastMaterial
from schemas import (
    ForecastInput,
    ForecastResponse,
    MaterialPrediction,
    ForecastWithPredictions,
)
import joblib
import pandas as pd

from material_index_map import MATERIAL_INDEX_TO_NAME

router = APIRouter(prefix="/forecast", tags=["Forecast API"])

materials_unit_prices_estimated = {
    # -----------------------------------------------------
    # Core Materials & Equipment (72 unique items)
    # -----------------------------------------------------
    'washers_qty': 5.00,
    'CT_units': 35000.00,
    'PT_units': 30000.00,
    'min_diesel_litre': 95.00,
    'earth_wire_km': 100000.00,
    'converter_transformer_oil_liters': 250.00,
    'curing_compound_liters': 150.00,
    'formwork_oil_liters': 100.00,
    'lubrication_grease_kg': 200.00,
    'binding_wire_kg': 65.00,
    'arcing_horn_units': 700.00,
    'guy_rope_m': 75.00,
    'tower_steel_kg': 68.00,
    'bolts_nuts_qty': 25.00,
    'gravel_tons': 1500.00,
    'circuit_breaker_units': 50000.00,
    'control_cable_m': 150.00,
    'paint_liters': 350.00,
    'isolator_units': 25000.00,
    'busbar_m': 800.00,
    'harmonic_filter_units': 45000.00,
    'vibration_dampers_units': 1200.00,
    'backfill_soil_cum': 300.00,
    'switchgear_units': 40000.00,
    'cement_bags': 360.00,
    'hardware_fittings_units': 1500.00,
    'spacers_units': 500.00,
    'excavated_soil_cum': 50.00,
    'shuttering_steel_sqm': 500.00,
    'clamps_units': 800.00,
    'jumpers_m': 1000.00,
    'conductor_km': 500000.00,
    'water_liters': 5.00,
    'extra_insulator_units': 2500.00,
    'OPGW_km': 200000.00,
    'galvanized_coating_kg': 30.00,
    'concrete_mix_cum': 5000.00,
    'spare_bolts_kg': 80.00,
    'spare_clamps_units': 700.00,
    'spare_conductor_m': 500.00,
    'reinforcement_steel_kg': 60.00,
    'packing_material_kg': 100.00,
    'ladder_units': 4000.00,
    'insulator_discs_units': 800.00,
    'spare_OPGW_m': 300.00,
    'DC_cable_km': 80000.00,
    'earthing_rod_units': 1500.00,
    'stay_wire_kg': 70.00,
    'cross_arm_units': 15000.00,
    'thyristor_valve_units': 50000000.00, # 5 Crore (HVDC Component)
    'transformer_oil_liters': 250.00,
    'tower_parts_units': 1000.00,
    'safety_equipment_units': 500.00,
    'spare_hardware_kg': 80.00,
    'sand_tons': 1000.00,
    'smoothing_reactor_units': 100000.00,
    'shuttering_wood_sqm': 400.00,
    'aggregate_tons': 1800.00,
    'earthing_cable_m': 120.00,
    'voltage_kv': 10000.00,        # Non-material parameter
    'duration_months': 10000.00,     # Non-material parameter
    'angle_steel_sections_kg': 65.00,
    'tower_legs_kg': 65.00,
    'tower_body_members_kg': 65.00,
    'extension_pieces_kg': 65.00,
    'pack_plates_kg': 65.00,
    'environment_charges_lakhs': 100000.00, # Charge unit
    # -----------------------------------------------------
    # Duplicate Items (Units in parentheses) - Priced as core material
    # -----------------------------------------------------
    'washers_qty (qty)': 5.00,
    'earth_wire_km (km)': 100000.00,
    'converter_transformer_oil_liters (liters)': 250.00,
    'curing_compound_liters (liters)': 150.00,
    'formwork_oil_liters (liters)': 100.00,
    'lubrication_grease_kg (kg)': 200.00,
    'binding_wire_kg (kg)': 65.00,
    'guy_rope_m (m)': 75.00,
    'tower_steel_kg (kg)': 68.00,
    'bolts_nuts_qty (qty)': 25.00,
    'gravel_tons (tons)': 1500.00,
    'control_cable_m (m)': 150.00,
    'paint_liters (liters)': 350.00,
    'busbar_m (m)': 800.00,
    'backfill_soil_cum (m3)': 300.00,
    'cement_bags (bags)': 360.00,
    'excavated_soil_cum (m3)': 50.00,
    'shuttering_steel_sqm (sqm)': 500.00,
    'jumpers_m (m)': 1000.00,
    'conductor_km (km)': 500000.00,
    'water_liters (liters)': 5.00,
    'OPGW_km (km)': 200000.00,
    'galvanized_coating_kg (kg)': 30.00,
    'concrete_mix_cum (m3)': 5000.00,
    'spare_bolts_kg (kg)': 80.00,
    'spare_conductor_m (m)': 500.00,
    'reinforcement_steel_kg (kg)': 60.00,
    'packing_material_kg (kg)': 100.00,
    'spare_OPGW_m (m)': 300.00,
    'DC_cable_km (km)': 80000.00,
    'stay_wire_kg (kg)': 70.00,
    'transformer_oil_liters (liters)': 250.00,
    'spare_hardware_kg (kg)': 80.00,
    'sand_tons (tons)': 1000.00,
    'shuttering_wood_sqm (sqm)': 400.00,
    'aggregate_tons (tons)': 1800.00,
    'earthing_cable_m (m)': 120.00,
    # -----------------------------------------------------
    # Calculated Total Price Keys (Priced at ₹1.00 as a placeholder for a 'total unit')
    # -----------------------------------------------------
    'environment_charges_lakhs_price': 1.00,
    'washers_qty (qty)_price': 1.00,
    'CT_units_price': 1.00,
    'PT_units_price': 1.00,
    'min_diesel_litre_price': 1.00,
    'earth_wire_km (km)_price': 1.00,
    'converter_transformer_oil_liters (liters)_price': 1.00,
    'curing_compound_liters (liters)_price': 1.00,
    'formwork_oil_liters (liters)_price': 1.00,
    'lubrication_grease_kg (kg)_price': 1.00,
    'binding_wire_kg (kg)_price': 1.00,
    'arcing_horn_units_price': 1.00,
    'guy_rope_m (m)_price': 1.00,
    'tower_steel_kg (kg)_price': 1.00,
    'bolts_nuts_qty (qty)_price': 1.00,
    'gravel_tons (tons)_price': 1.00,
    'circuit_breaker_units_price': 1.00,
    'control_cable_m (m)_price': 1.00,
    'paint_liters (liters)_price': 1.00,
    'isolator_units_price': 1.00,
    'busbar_m (m)_price': 1.00,
    'harmonic_filter_units_price': 1.00,
    'vibration_dampers_units_price': 1.00,
    'backfill_soil_cum (m3)_price': 1.00,
    'switchgear_units_price': 1.00,
    'cement_bags (bags)_price': 1.00,
    'hardware_fittings_units_price': 1.00,
    'spacers_units_price': 1.00,
    'excavated_soil_cum (m3)_price': 1.00,
    'shuttering_steel_sqm (sqm)_price': 1.00,
    'clamps_units_price': 1.00,
    'jumpers_m (m)_price': 1.00,
    'conductor_km (km)_price': 1.00,
    'water_liters (liters)_price': 1.00,
    'extra_insulator_units_price': 1.00,
    'OPGW_km (km)_price': 1.00,
    'galvanized_coating_kg (kg)_price': 1.00,
    'concrete_mix_cum (m3)_price': 1.00,
    'spare_bolts_kg (kg)_price': 1.00,
    'spare_clamps_units_price': 1.00,
    'spare_conductor_m (m)_price': 1.00,
    'reinforcement_steel_kg (kg)_price': 1.00,
    'packing_material_kg (kg)_price': 1.00,
    'ladder_units_price': 1.00,
    'insulator_discs_units_price': 1.00,
    'spare_OPGW_m (m)_price': 1.00,
    'DC_cable_km (km)_price': 1.00,
    'earthing_rod_units_price': 1.00,
    'stay_wire_kg (kg)_price': 1.00,
    'cross_arm_units_price': 1.00,
    'thyristor_valve_units_price': 1.00,
    'transformer_oil_liters (liters)_price': 1.00,
    'tower_parts_units_price': 1.00,
    'safety_equipment_units_price': 1.00,
    'spare_hardware_kg (kg)_price': 1.00,
    'sand_tons (tons)_price': 1.00,
    'smoothing_reactor_units_price': 1.00,
    'shuttering_wood_sqm (sqm)_price': 1.00,
    'aggregate_tons (tons)_price': 1.00,
    'earthing_cable_m (m)_price': 1.00,
    'angle_steel_sections_kg_price': 1.00,
    'tower_legs_kg_price': 1.00,
    'tower_body_members_kg_price': 1.00,
    'extension_pieces_kg_price': 1.00,
    'pack_plates_kg_price': 1.00,
}

# -----------------------------------
# 🔥 Load Model + Scaler Once
# -----------------------------------
try:
    model = joblib.load("Balanced_Material_Model.pkl")
    y_scaler = joblib.load("Balanced_YScaler.pkl")
    print("✅ ML Model + Scaler Loaded")
except:
    model, y_scaler = None, None
    print("⚠️ MODEL LOAD FAILED — Check file paths")


INPUT_FEATURES = [
    "project_category_main",
    "project_type",
    "project_budget_price_in_lake",
    "state",
    "terrain",
    "distance_from_storage_unit",
    "transmission_line_length_km",
]


# ======================================================================================
# 1️⃣ PREDICT + SAVE to DATABASE (Your Existing Feature Improved)
# ======================================================================================
# change-1(4-12-2025)
@router.post("/save")
def save_forecast(body: ForecastInput, db: Session = Depends(get_db)):

    if model is None:
        raise HTTPException(500, "ML model not loaded")

    # -------------- SAVE INPUT TO DB --------------
    entry = Forecast(
        project_category_main=body.project_category_main,
        project_type=body.project_type,
        project_budget_price_in_lake=body.project_budget_price_in_lake,
        state=body.state,
        terrain=body.terrain,
        distance_from_storage_unit=body.distance_from_storage_unit,
        transmission_line_length_km=body.transmission_line_length_km,
        location=body.location,
        project_name=body.project_name,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    # -------------- PREPARE DATAFRAME FOR MODEL --------------
    X_df = pd.DataFrame([{
        "project_category_main": body.project_category_main,
        "project_type": body.project_type,
        "project_budget_price_in_lake": body.project_budget_price_in_lake,
        "state": body.state,
        "terrain": body.terrain,

        # canonical API / DB field (keep this)
        "distance_from_storage_unit": body.distance_from_storage_unit,

        # legacy/model compatibility column (exact name expected by saved pipeline)
        "Distance_from_Storage_unit": body.distance_from_storage_unit,

        "transmission_line_length_km": body.transmission_line_length_km,
    }])

    scaled_output = model.predict(X_df)
    final_pred = y_scaler.inverse_transform(scaled_output)[0]

    # -------------- MAP PREDICTIONS TO MATERIAL NAMES --------------
    predictions = [
        MaterialPrediction(
            material_name=MATERIAL_INDEX_TO_NAME.get(i, f"material_{i}"),
            predicted_value=float(v)
        )
        for i, v in enumerate(final_pred)
    ]

    print("\n📌 Forecast Saved → ID:", entry.id)
    print("██████ MODEL OUTPUT ██████")
    print(final_pred)

    # provide materials array expected by frontend
    materials = [
        {
            "name": p.material_name,
            "quantity": p.predicted_value,
            "unit": "units",

            # unit cost logic
            "unitCost": materials_unit_prices_estimated.get(
                p.material_name,
                1.0 if p.material_name.endswith("_price") else 0
            ),

            # total cost = quantity × unit cost
            "totalCost": float(p.predicted_value) * float(
                materials_unit_prices_estimated.get(
                    p.material_name,
                    1.0 if p.material_name.endswith("_price") else 0
                )
            )
        }
        for p in predictions
    ]

    # -------------- SAVE FORECAST MATERIALS TO DB --------------
    for p in predictions:
        unit_cost = materials_unit_prices_estimated.get(
            p.material_name,
            1.0 if p.material_name.endswith("_price") else 0
        )
        total_cost = float(p.predicted_value) * float(unit_cost)
        
        forecast_material = ForecastMaterial(
            forecast_id=entry.id,
            material_name=p.material_name,
            predicted_qty=p.predicted_value,
            unit="units",
            unit_cost=unit_cost,
            total_cost=total_cost
        )
        db.add(forecast_material)
    
    # compute subtotal, gst, total for save response
    subtotal = float(sum(item.get("totalCost", 0.0) for item in materials))
    gst = float(subtotal * 0.18)
    total = float(subtotal + gst)
    
    # Update forecast with cost and budget info before commit
    entry.total = total
    entry.budget = body.project_budget_price_in_lake
    entry.project_name = body.project_name or "Unknown"
    
    db.commit()

    return {
        "forecastId": entry.id,
        "projectName": body.project_name,
        "projectType": body.project_type,
        "location": body.location,
        "region": body.state,
        "startDate": "",
        "endDate": "",
        "lineLength": body.transmission_line_length_km,
        "confidence": 90,
        "materials": materials,
        "predictions": predictions,
        "subtotal": subtotal,
        "gst": gst,
        "total": total
    }



# ======================================================================================
# 2️⃣ ONLY PREDICT (NO DATABASE SAVE) — For UI Instant Forecast ⚡
# ======================================================================================
# change-2(4-12-2025)
@router.post("/predict")
def predict_only(body: ForecastInput):

    if model is None:
        raise HTTPException(500, "ML model not loaded")

    X_df = pd.DataFrame([{
        "project_category_main": body.project_category_main,
        "project_type": body.project_type,
        "project_budget_price_in_lake": body.project_budget_price_in_lake,
        "state": body.state,
        "terrain": body.terrain,

        # canonical API / DB field (keep this)
        "distance_from_storage_unit": body.distance_from_storage_unit,

        # legacy/model compatibility column (exact name expected by saved pipeline)
        "Distance_from_Storage_unit": body.distance_from_storage_unit,

        "transmission_line_length_km": body.transmission_line_length_km,
    }])

    scaled_output = model.predict(X_df)
    final_pred = y_scaler.inverse_transform(scaled_output)[0]

    results = [
        MaterialPrediction(
            material_name=MATERIAL_INDEX_TO_NAME.get(i, f"material_{i}"),
            predicted_value=float(v)
        )
        for i, v in enumerate(final_pred)
    ]

    # provide materials array expected by frontend
    materials = [
        {
            "name": r.material_name,
            "quantity": float(r.predicted_value),
            "unit": "units",

            # unitCost: use dict fallback, or 1.0 for *_price keys, else 0.0
            "unitCost": materials_unit_prices_estimated.get(
                r.material_name,
                1.0 if r.material_name.endswith("_price") else 0.0
            ),

            # totalCost = quantity * unitCost
            "totalCost": float(r.predicted_value) * float(
                materials_unit_prices_estimated.get(
                    r.material_name,
                    1.0 if r.material_name.endswith("_price") else 0.0
                )
            )
        }
        for r in results
    ]

    # Calculate subtotal = sum of all totalCost values
    subtotal = sum(item["totalCost"] for item in materials)

    # GST = 18% of subtotal
    gst = subtotal * 0.18

    # Final total
    total = subtotal + gst

    return {
        "materials": materials,
        "subtotal": subtotal,
        "gst": gst,
        "total": total,
        "predictions": results
    }

# lightweight router root (already present or add if needed)
@router.get("/")
def forecast_root():
    return {"message": "Forecast API OK"}


@router.get("/history")
def get_forecast_history(db: Session = Depends(get_db)):
    """
    Returns real saved forecast data from database for Forecast History page.
    """
    forecasts = (
        db.query(Forecast)
        .order_by(Forecast.id.desc())
        .all()
    )
    
    result = []
    for f in forecasts:
        result.append({
            "projectName": f.project_name,
            "estimatedCost": f.total,
            "actualCost": f.budget,
            "accuracy": float(f.accuracy) if f.accuracy is not None else None,
            "status": f.status
        })
    
    return result


@router.get("", response_model=list[ForecastResponse])
def list_forecasts(db: Session = Depends(get_db)):
    return db.query(Forecast).all()
