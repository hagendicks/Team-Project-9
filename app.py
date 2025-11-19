# app.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import numpy as np, pandas as pd, joblib
from typing import Optional
from fastapi.routing import APIRoute
import json, os

app = FastAPI(title="GPE Feasibility Predictor", version="1.0")

# Serve static under /static and index.html at /
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root_page():
    return FileResponse("static/index.html")

# Load your trained pipeline (next to this file)
pipe = joblib.load("gpe_xgb_model.pkl")

class GPEInput(BaseModel):
    Lng: float; Lat: float; followers: float; price: float; square: float
    livingRoom: float; drawingRoom: float; kitchen: float; bathRoom: float
    floor: str = Field(description="Low/Middle/High")
    buildingType: float; renovationCondition: float; buildingStructure: float
    ladderRatio: float; elevator: float; fiveYearsProperty: float; subway: float
    constructionTime: float; district: int
    communityAverage: Optional[float] = None

# after loading the model:
CALIB = {"dom_cap_p95": 180.0}  # fallback if file missing
if os.path.exists("gpe_calib.json"):
    with open("gpe_calib.json") as f:
        CALIB.update(json.load(f))

DOM_CAP = max(1.0, float(CALIB.get("dom_cap_p95", 180.0)))

def preprocess_payload(p: GPEInput) -> pd.DataFrame:
    d = p.dict()
    # floor -> floor_level
    floor_txt = str(d.get("floor","")).strip().title()
    floor_txt = {"Ground":"Low","Basement":"Low","Unknown":"Middle"}.get(floor_txt, floor_txt)
    d["floor_level"] = {"Low":0,"Middle":1,"High":2}.get(floor_txt, 1)
    # property age using 2017 sale year
    sale_year = 2017
    d["property_age"] = max(0.0, min(70.0, sale_year - float(d.get("constructionTime", sale_year))))
    # log features if present
    for name in ["price","square","followers","communityAverage","totalPrice","ladderRatio"]:
        if name in d and d[name] is not None:
            v = float(d[name]); d[f"log_{name}"] = np.log1p(v) if v >= 0 else 0.0
    return pd.DataFrame([d])

@app.post("/api/predict")
def predict(inp: GPEInput):
    X = preprocess_payload(inp)
    y = pipe.predict(X).astype(float)
    y = np.clip(y, 0, None)
    y = pipe.predict(X).astype(float)
    y = np.clip(y, 0, None)
    dfs = np.clip(100.0 * (1.0 - y / DOM_CAP), 0.0, 100.0)
    return JSONResponse({
        "predicted_DOM_days": float(np.round(y[0], 1)),
        "DFS_percent": float(np.round(dfs[0], 1))
    })

# Debug route to confirm routing
@app.get("/routes")
def list_routes():
    return [{"path": r.path, "methods": list(r.methods)} for r in app.routes if isinstance(r, APIRoute)]
