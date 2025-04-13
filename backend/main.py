from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uvicorn
import os
import shutil
import uuid
import tempfile
from typing import Optional

app = FastAPI(title="WebAudio Studio API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Create temp directory for audio processing
TEMP_DIR = tempfile.mkdtemp()

@app.on_event("shutdown")
async def shutdown_event():
    # Clean up temp files
    shutil.rmtree(TEMP_DIR, ignore_errors=True)

@app.get("/")
async def root():
    return {"message": "WebAudio Studio API"}

@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    # Generate unique ID for this session
    session_id = str(uuid.uuid4())
    
    # Create session directory
    session_dir = os.path.join(TEMP_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    # Save uploaded file
    file_path = os.path.join(session_dir, "original" + os.path.splitext(file.filename)[1])
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "session_id": session_id,
        "filename": file.filename,
        "file_path": file_path
    }

@app.post("/trim")
async def trim_audio(
    session_id: str = Form(...),
    start_time: float = Form(...),
    end_time: float = Form(...),
    crossfade: Optional[float] = Form(0.0)
):
    # Simplified placeholder implementation
    return JSONResponse(
        status_code=200,
        content={
            "message": "Trim operation requested",
            "start_time": start_time,
            "end_time": end_time,
            "crossfade": crossfade,
            "output_file": f"trim_result_{session_id}.mp3"
        }
    )

@app.post("/split")
async def split_audio(
    session_id: str = Form(...),
    split_points: str = Form(...)  # Format: "1.5,4.2,7.8" (time in seconds)
):
    # Simplified placeholder implementation
    split_times = [float(t) for t in split_points.split(",")]
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "Split operation requested",
            "split_points": split_times,
            "output_files": [f"segment_{i+1}_{session_id}.mp3" for i in range(len(split_times) + 1)]
        }
    )

@app.post("/equalize")
async def apply_eq(
    session_id: str = Form(...),
    eq_values: str = Form(...)  # Format: "-3,0,2,5,-1,0,3,-2" (dB values)
):
    # Simplified placeholder implementation
    eq_values_list = [int(v) for v in eq_values.split(",")]
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "Equalizer applied",
            "eq_values": eq_values_list
        }
    )

@app.post("/extract-vocals")
async def extract_vocals(
    session_id: str = Form(...)
):
    # Simplified placeholder implementation
    return JSONResponse(
        status_code=200,
        content={
            "message": "Vocal extraction requested",
            "vocals_file": f"vocals_{session_id}.mp3",
            "instrumental_file": f"instrumental_{session_id}.mp3"
        }
    )

@app.get("/download/{session_id}/{filename}")
async def download_file(session_id: str, filename: str):
    file_path = os.path.join(TEMP_DIR, session_id, filename)
    if not os.path.exists(file_path):
        return JSONResponse(
            status_code=404,
            content={"error": "File not found"}
        )
    
    return FileResponse(file_path)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info") 