import joblib
import numpy as np

model = joblib.load("forecast_model.pkl")

def predict_cost(data):
    input_data = np.array([[
        data.budget,
        data.line_length,
        data.region,
        data.project_type,
        data.tower_type,
        data.substation_type
    ]])

    prediction = model.predict(input_data)[0]
    return {
        "material_cost": float(prediction[0]),
        "labour_cost": float(prediction[1]),
        "total_cost": float(prediction[2])
    }
