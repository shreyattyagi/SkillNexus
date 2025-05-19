# backend/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import json 


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load skills list (flat list for now)
with open("skills.json", "r") as f:
    SKILLS = json.load(f)

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    contents = await file.read()
    
    with open("temp.pdf", "wb") as f:
        f.write(contents)

    doc = fitz.open("temp.pdf")
    text = ""
    for page in doc:
        text += page.get_text()

    # Simple keyword matching
    extracted = [skill for skill in SKILLS if skill.lower() in text.lower()]
    return {"skills": extracted}
