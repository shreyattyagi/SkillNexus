# backend/main.py
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pdfplumber
import json 
import re
import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from auth import (
    authenticate_user,
    create_access_token,
    verify_token,
    hash_password
)
from database import save_resume_analysis, get_user_analyses, create_user, get_user
from pdf_generator import create_pdf_report
from resume_generator import generate_resume

app = FastAPI()

# Get the current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Get environment variables
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load skills list and job skills
with open(os.path.join(BASE_DIR, "skills.json"), "r") as f:
    SKILLS = json.load(f)

with open(os.path.join(BASE_DIR, "job_skills.json"), "r") as f:
    JOB_SKILLS = json.load(f)

with open(os.path.join(BASE_DIR, "skill_categories.json"), "r") as f:
    SKILL_CATEGORIES = json.load(f)

# Load industry data
with open(os.path.join(BASE_DIR, 'industries.json'), 'r') as f:
    industries_data = json.load(f)

# Auth models
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str

class ResumeData(BaseModel):
    jobRole: str
    resumeData: dict

# Constants
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get the current user from the JWT token."""
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user(payload.get("sub"))
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Remove sensitive information
    user.pop("hashed_password", None)
    return user

# Register new user function
def register_new_user(email: str, password: str) -> dict:
    """Register a new user with email and password."""
    if get_user(email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(password)
    user_id = create_user(email, hashed_password)
    return {"id": str(user_id.inserted_id), "email": email}

@app.post("/register")
async def register(user_data: UserRegister):
    try:
        user = register_new_user(user_data.email, user_data.password)
        return {"message": "User registered successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
async def login(user_data: UserLogin):
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "email": user["email"]
    }

@app.get("/user/analyses")
async def get_analyses(current_user: dict = Depends(get_current_user)):
    analyses = get_user_analyses(str(current_user["_id"]))
    return {"analyses": analyses}

def analyze_resume_format(text: str) -> Dict:
    # Basic format analysis
    sections = {
        "has_contact": bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)),  # Email
        "has_phone": bool(re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text)),  # Phone
        "has_education": any(word in text.lower() for word in ["education", "university", "college", "degree"]),
        "has_experience": any(word in text.lower() for word in ["experience", "work", "employment"]),
        "has_skills": any(word in text.lower() for word in ["skills", "technologies", "tools"]),
    }
    
    format_score = sum(sections.values()) * 20  # Each section worth 20 points
    return {
        "sections": sections,
        "format_score": format_score
    }

def calculate_ats_score(text: str, extracted_skills: List[str], job_title: str = None) -> Dict:
    # Format analysis
    format_analysis = analyze_resume_format(text)
    
    # Skills analysis
    skills_score = len(extracted_skills) * 5  # 5 points per skill
    skills_score = min(skills_score, 100)  # Cap at 100
    
    # Job match analysis if job title provided
    job_match_score = 0
    if job_title and job_title in JOB_SKILLS:
        required_skills = JOB_SKILLS[job_title]
        matching_skills = [skill for skill in required_skills if skill in extracted_skills]
        job_match_score = (len(matching_skills) / len(required_skills)) * 100
    
    # Calculate final ATS score
    ats_score = (format_analysis["format_score"] * 0.4 + skills_score * 0.3 + 
                (job_match_score * 0.3 if job_title else skills_score * 0.3))
    
    return {
        "overall_ats_score": round(ats_score, 1),
        "format_score": format_analysis["format_score"],
        "skills_score": skills_score,
        "job_match_score": round(job_match_score, 1) if job_title else None,
        "format_analysis": format_analysis["sections"],
        "improvement_suggestions": generate_improvement_suggestions(
            format_analysis["sections"],
            extracted_skills,
            job_title,
            JOB_SKILLS.get(job_title, []) if job_title else []
        )
    }

def generate_improvement_suggestions(format_analysis: Dict, 
                                  extracted_skills: List[str],
                                  job_title: str = None,
                                  required_skills: List[str] = None) -> List[str]:
    suggestions = []
    
    # Format-based suggestions
    if not format_analysis["has_contact"]:
        suggestions.append("Add contact information including email and phone number")
    if not format_analysis["has_education"]:
        suggestions.append("Include an education section with your academic background")
    if not format_analysis["has_experience"]:
        suggestions.append("Add work experience section with detailed role descriptions")
    if not format_analysis["has_skills"]:
        suggestions.append("Create a dedicated skills section to highlight your capabilities")
    
    # Skills-based suggestions
    if job_title and required_skills:
        missing_skills = [skill for skill in required_skills if skill not in extracted_skills]
        if missing_skills:
            suggestions.append(f"Consider acquiring these skills for {job_title}: {', '.join(missing_skills)}")
    
    # General ATS suggestions
    suggestions.extend([
        "Use standard section headings (e.g., 'Experience' instead of 'Career History')",
        "Ensure your resume is in a simple, single-column format",
        "Use standard fonts like Arial or Calibri",
        "Avoid using tables, images, or complex formatting"
    ])
    
    return suggestions

def categorize_skills(skills):
    categorized = {}
    for category, data in SKILL_CATEGORIES.items():
        matching_skills = [skill for skill in skills if skill in data["skills"]]
        if matching_skills:
            categorized[category] = {
                "icon": data["icon"],
                "skills": matching_skills
            }
    return categorized

@app.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    contents = await file.read()
    
    with open("temp.pdf", "wb") as f:
        f.write(contents)

    text = ""
    with pdfplumber.open("temp.pdf") as pdf:
        for page in pdf.pages:
            text += page.extract_text()

    # Extract skills
    extracted_skills = [skill for skill in SKILLS if skill.lower() in text.lower()]
    
    # Calculate ATS score
    ats_analysis = calculate_ats_score(text, extracted_skills)
    
    # Save analysis to database
    analysis_data = {
        "skills": extracted_skills,
        "ats_analysis": ats_analysis,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    save_resume_analysis(
        str(current_user["_id"]),
        file.filename,
        analysis_data
    )
    
    return {
        "skills": extracted_skills,
        "ats_analysis": ats_analysis
    }

@app.get("/jobs")
async def get_jobs():
    return {"jobs": list(JOB_SKILLS.keys())}

@app.post("/compare")
async def compare_skills(
    job_title: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if job_title not in JOB_SKILLS:
        return {"error": "Job title not found"}
        
    contents = await file.read()
    
    with open("temp.pdf", "wb") as f:
        f.write(contents)

    text = ""
    with pdfplumber.open("temp.pdf") as pdf:
        for page in pdf.pages:
            text += page.extract_text()

    # Extract skills
    extracted_skills = [skill for skill in SKILLS if skill.lower() in text.lower()]
    
    # Get required skills for the job
    required_skills = JOB_SKILLS[job_title]
    
    # Calculate matching and missing skills
    matching_skills = [skill for skill in required_skills if skill in extracted_skills]
    missing_skills = [skill for skill in required_skills if skill not in extracted_skills]
    
    # Calculate match percentage
    match_percentage = len(matching_skills) / len(required_skills) * 100 if required_skills else 0
    
    # Calculate ATS score
    ats_analysis = calculate_ats_score(text, extracted_skills, job_title)
    
    # Save analysis to database
    analysis_data = {
        "job_title": job_title,
        "extracted_skills": extracted_skills,
        "required_skills": required_skills,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "match_percentage": round(match_percentage, 1),
        "ats_analysis": ats_analysis,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    save_resume_analysis(
        str(current_user["_id"]),
        file.filename,
        analysis_data
    )
    
    return {
        "extracted_skills": extracted_skills,
        "required_skills": required_skills,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "match_percentage": round(match_percentage, 1),
        "ats_analysis": ats_analysis
    }

@app.get("/download-report/{analysis_id}")
async def download_report(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Get the analysis data
    analysis = analyses.find_one({"_id": ObjectId(analysis_id)})
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Check if the analysis belongs to the current user
    if str(analysis["user_id"]) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to access this report")
    
    try:
        # Generate the PDF report
        pdf_path = create_pdf_report(analysis["filename"], analysis["analysis_data"])
        
        # Return the PDF file
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"resume_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-resume")
async def generate_resume_endpoint(
    data: ResumeData,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Generate the resume
        pdf_path = generate_resume(data.jobRole, data.resumeData)
        
        # Return the PDF file
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/industries")
async def get_industries():
    """Get all available industries"""
    return {
        "industries": [
            {
                "name": industry,
                "icon": data["icon"],
                "description": data["description"]
            }
            for industry, data in industries_data.items()
        ]
    }

@app.get("/api/industries/{industry}/job-profiles")
async def get_job_profiles(industry: str):
    """Get all job profiles for a specific industry"""
    if industry not in industries_data:
        raise HTTPException(status_code=404, detail="Industry not found")
    
    return {
        "job_profiles": [
            {
                "category": category,
                "sub_categories": [
                    {
                        "name": sub["name"],
                        "required_skills": sub["required_skills"],
                        "recommended_skills": sub["recommended_skills"]
                    }
                    for sub in profiles["sub_categories"]
                ]
            }
            for category, profiles in industries_data[industry]["job_profiles"].items()
        ]
    }

def calculate_skill_match_score(user_skills: List[str], required_skills: List[str], recommended_skills: List[str]) -> Dict:
    """Calculate a weighted skill match score with detailed analysis"""
    user_skills_set = set(skill.lower() for skill in user_skills)
    required_skills_set = set(skill.lower() for skill in required_skills)
    recommended_skills_set = set(skill.lower() for skill in recommended_skills)
    
    # Calculate exact matches
    matching_required = required_skills_set & user_skills_set
    matching_recommended = recommended_skills_set & user_skills_set
    
    # Calculate partial matches (skills that contain or are contained by user skills)
    partial_matches_required = set()
    partial_matches_recommended = set()
    
    for user_skill in user_skills_set:
        for req_skill in required_skills_set:
            if user_skill in req_skill or req_skill in user_skill:
                partial_matches_required.add(req_skill)
        for rec_skill in recommended_skills_set:
            if user_skill in rec_skill or rec_skill in user_skill:
                partial_matches_recommended.add(rec_skill)
    
    # Calculate scores
    required_exact_score = len(matching_required) / len(required_skills_set) * 100
    required_partial_score = len(partial_matches_required - matching_required) / len(required_skills_set) * 50
    recommended_exact_score = len(matching_recommended) / len(recommended_skills_set) * 100
    recommended_partial_score = len(partial_matches_recommended - matching_recommended) / len(recommended_skills_set) * 50
    
    # Calculate final weighted score
    required_score = required_exact_score + required_partial_score
    recommended_score = recommended_exact_score + recommended_partial_score
    overall_score = (required_score * 0.7) + (recommended_score * 0.3)
    
    # Identify missing skills
    missing_required = required_skills_set - user_skills_set
    missing_recommended = recommended_skills_set - user_skills_set
    
    # Categorize skills
    skill_categories = {
        "Technical": [],
        "Soft Skills": [],
        "Tools": [],
        "Domain Knowledge": []
    }
    
    for skill in user_skills:
        if any(tech in skill.lower() for tech in ["programming", "code", "software", "development", "engineering"]):
            skill_categories["Technical"].append(skill)
        elif any(soft in skill.lower() for soft in ["communication", "leadership", "management", "team", "problem"]):
            skill_categories["Soft Skills"].append(skill)
        elif any(tool in skill.lower() for tool in ["tool", "software", "platform", "system"]):
            skill_categories["Tools"].append(skill)
        else:
            skill_categories["Domain Knowledge"].append(skill)
    
    return {
        "overall_score": round(overall_score, 2),
        "required_score": round(required_score, 2),
        "recommended_score": round(recommended_score, 2),
        "matching_skills": {
            "required": list(matching_required),
            "recommended": list(matching_recommended)
        },
        "partial_matches": {
            "required": list(partial_matches_required - matching_required),
            "recommended": list(partial_matches_recommended - matching_recommended)
        },
        "missing_skills": {
            "required": list(missing_required),
            "recommended": list(missing_recommended)
        },
        "skill_categories": skill_categories,
        "improvement_suggestions": generate_skill_improvement_suggestions(
            missing_required,
            missing_recommended,
            skill_categories
        )
    }

def generate_skill_improvement_suggestions(
    missing_required: set,
    missing_recommended: set,
    skill_categories: Dict
) -> List[str]:
    """Generate personalized skill improvement suggestions"""
    suggestions = []
    
    # Analyze missing required skills
    if missing_required:
        suggestions.append("Priority skills to acquire:")
        for skill in list(missing_required)[:3]:  # Top 3 missing required skills
            suggestions.append(f"- {skill}")
    
    # Analyze missing recommended skills
    if missing_recommended:
        suggestions.append("\nAdditional skills to consider:")
        for skill in list(missing_recommended)[:3]:  # Top 3 missing recommended skills
            suggestions.append(f"- {skill}")
    
    # Analyze skill category balance
    category_counts = {k: len(v) for k, v in skill_categories.items()}
    min_category = min(category_counts.items(), key=lambda x: x[1])
    if min_category[1] < 3:  # If any category has less than 3 skills
        suggestions.append(f"\nConsider developing more {min_category[0].lower()} skills")
    
    # Add general improvement suggestions
    suggestions.extend([
        "\nGeneral recommendations:",
        "- Focus on acquiring the missing required skills first",
        "- Consider taking online courses or certifications for key missing skills",
        "- Look for projects or work opportunities to practice new skills",
        "- Network with professionals in the field to learn about skill requirements"
    ])
    
    return suggestions

@app.post("/api/resume/analyze-job-fit")
async def analyze_job_fit(
    job_profile: str,
    sub_category: str,
    industry: str,
    skills: List[str],
    token: str = Depends(verify_token)
):
    """Analyze how well a user's skills match a specific job profile"""
    if industry not in industries_data:
        raise HTTPException(status_code=404, detail="Industry not found")
    
    # Find the job profile and sub-category
    job_data = None
    for category in industries_data[industry]["job_profiles"].values():
        for sub in category["sub_categories"]:
            if sub["name"] == sub_category:
                job_data = sub
                break
        if job_data:
            break
    
    if not job_data:
        raise HTTPException(status_code=404, detail="Job profile not found")
    
    # Calculate detailed skill match analysis
    skill_analysis = calculate_skill_match_score(
        skills,
        job_data["required_skills"],
        job_data["recommended_skills"]
    )
    
    return {
        "job_profile": job_profile,
        "sub_category": sub_category,
        "industry": industry,
        "match_analysis": skill_analysis
    }

@app.post("/api/resume/generate-job-specific")
async def generate_job_specific_resume(
    job_profile: str,
    sub_category: str,
    industry: str,
    skills: List[str],
    experience: List[Dict],
    education: List[Dict],
    token: str = Depends(verify_token)
):
    """Generate a job-specific resume based on the target role"""
    if industry not in industries_data:
        raise HTTPException(status_code=404, detail="Industry not found")
    
    # Find the job profile and sub-category
    job_data = None
    for category in industries_data[industry]["job_profiles"].values():
        for sub in category["sub_categories"]:
            if sub["name"] == sub_category:
                job_data = sub
                break
        if job_data:
            break
    
    if not job_data:
        raise HTTPException(status_code=404, detail="Job profile not found")
    
    # Generate resume with job-specific focus
    resume_content = generate_resume(
        skills=skills,
        experience=experience,
        education=education,
        target_role=job_profile,
        target_skills=job_data["required_skills"] + job_data["recommended_skills"]
    )
    
    # Create PDF report
    report_path = create_pdf_report(
        resume_content,
        f"resume_{job_profile.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )
    
    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=os.path.basename(report_path)
    )

# Mount frontend static files only in production
if os.path.exists(os.path.join(BASE_DIR, "../frontend/build")):
    app.mount("/", StaticFiles(directory=os.path.join(BASE_DIR, "../frontend/build"), html=True), name="frontend") 