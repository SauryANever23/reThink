from fastapi import FastAPI, HTTPException
from models import UserPreferences
from engine import TradeOffEngine
import json

app = FastAPI(title="TradeOff API")

# Load seed data (Mocked for brevity)
with open("seed_data.json", "r") as f:
    CATALOG = json.load(f)

engine = TradeOffEngine(CATALOG)

@app.post("/api/decisions")
def create_decision(prefs: UserPreferences):
    bundles = engine.generate_bundles(prefs)
    
    if not bundles:
        raise HTTPException(status_code=400, detail="No feasible combination satisfies all mandatory requirements within this budget.")
    
    # Calculate opportunity cost for the top choice
    top_choice = bundles[0]
    opp_cost = engine.calculate_opportunity_cost(top_choice, bundles)
    
    return {
        "strategies": [b.dict() for b in bundles],
        "opportunity_cost": opp_cost
    }
