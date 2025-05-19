import os
from openai import OpenAI
from typing import Dict, List
import json

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Load skills and job data
with open("job_skills.json", "r") as f:
    JOB_SKILLS = json.load(f)

with open("skill_categories.json", "r") as f:
    SKILL_CATEGORIES = json.load(f)

def get_chatbot_response(message: str, context: Dict = None) -> str:
    try:
        # Prepare system message with context
        system_message = """You are an AI career advisor and resume expert. You can help users with:
        1. Resume improvement suggestions
        2. Skills needed for specific job roles
        3. Career advice and job market insights
        4. ATS optimization tips
        5. Industry-specific resume guidance
        
        Use the provided job skills and categories data when relevant to give accurate, specific advice."""
        
        # Add context about available jobs and skills
        system_message += f"\n\nAvailable job roles: {', '.join(JOB_SKILLS.keys())}"
        
        # Create the conversation
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": message}
        ]
        
        # If there's context from previous conversation, add it
        if context and 'history' in context:
            messages[1:1] = context['history'][-5:]  # Include last 5 messages for context
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"I apologize, but I encountered an error: {str(e)}"

def get_job_requirements(job_title: str) -> Dict:
    """Get specific job requirements from our database."""
    if job_title in JOB_SKILLS:
        return {
            "required_skills": JOB_SKILLS[job_title],
            "categories": {
                category: skills
                for category, skills in SKILL_CATEGORIES.items()
                if any(skill in JOB_SKILLS[job_title] for skill in skills["skills"])
            }
        }
    return None

def suggest_skill_improvements(current_skills: List[str], target_job: str) -> Dict:
    """Suggest skills to develop for a specific job role."""
    if target_job in JOB_SKILLS:
        required_skills = set(JOB_SKILLS[target_job])
        current_skills_set = set(current_skills)
        
        missing_skills = list(required_skills - current_skills_set)
        matching_skills = list(required_skills & current_skills_set)
        
        return {
            "missing_skills": missing_skills,
            "matching_skills": matching_skills,
            "completion_percentage": len(matching_skills) / len(required_skills) * 100
        }
    return None 