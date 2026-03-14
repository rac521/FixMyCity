from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn

from models.image_classifier import classify_image
from models.duplicate_detector import check_duplicate
from models.risk_assessment import calculate_risk_score

app = FastAPI(title="CivicPulse AI Service")

# Allow CORS for backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "CivicPulse AI Service"}

@app.post("/ai/classify-issue")
async def api_classify_issue(image: UploadFile = File(...)):
    # Read image bytes
    image_bytes = await image.read()
    
    # Classify image
    result = classify_image(image_bytes)
    return result

@app.post("/ai/check-duplicate")
async def api_check_duplicate(
    latitude: float = Form(...),
    longitude: float = Form(...),
    image: Optional[UploadFile] = File(None)
):
    image_bytes = None
    if image:
        image_bytes = await image.read()
        
    result = check_duplicate(latitude, longitude, image_bytes)
    return result

@app.post("/ai/risk-score")
async def api_risk_score(
    issue_type: str = Form(...),
    duplicate_count: int = Form(...),
    location_type: str = Form("normal")
):
    result = calculate_risk_score(issue_type, duplicate_count, location_type)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
