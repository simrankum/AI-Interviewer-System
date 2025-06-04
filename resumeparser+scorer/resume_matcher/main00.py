import os
import json
import re
import PyPDF2
from app.parser import parse_resume
from app.matcher import extract_additional_skills, calculate_match_score
from app.feedback_generator import generate_feedback
from app.utils import generate_unique_id

# === Configuration ===
RESUME_DIR = "/Users/studu/Desktop/resumeparser+scorer/Data/Resumes/"
JOB_DESCRIPTION_DIR = "/Users/studu/Desktop/resumeparser+scorer/Data/JobDescription/"
OUTPUT_FILE = "outputs/match_result.json"

def extract_text_from_pdf(pdf_path):
    """Extract text content from a PDF file"""
    with open(pdf_path, "rb") as f:
        pdf_reader = PyPDF2.PdfReader(f)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text.strip()

def extract_name_and_email(resume_text):
    name_pattern = r"(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:\n|$)"
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
    
    name_match = re.search(name_pattern, resume_text)
    email_match = re.search(email_pattern, resume_text)

    full_name = name_match.group(1).strip() if name_match else None
    first_name, *last_name = full_name.split() if full_name else (None, None)
    last_name = " ".join(last_name) if last_name else None
    email = email_match.group(0) if email_match else None
    
    return first_name, last_name, email

# === Initialize final output container ===
final_output = {
    "success": True,
    "jobMatches": []  # List of job-wise results
}

# === Iterate over job descriptions ===
for jd_file in os.listdir(JOB_DESCRIPTION_DIR):
    if not jd_file.lower().endswith(".pdf"):
        continue

    jd_path = os.path.join(JOB_DESCRIPTION_DIR, jd_file)
    try:
        job_description = extract_text_from_pdf(jd_path)
        job_skills = extract_additional_skills(job_description) or ["React", "TypeScript", "HTML", "CSS", "JavaScript", "Git"]

        job_results = []

        for file_name in os.listdir(RESUME_DIR):
            if not file_name.lower().endswith('.pdf'):
                continue

            file_path = os.path.join(RESUME_DIR, file_name)
            try:
                resume_text = extract_text_from_pdf(file_path)
                first_name, last_name, email = extract_name_and_email(resume_text)
                
                resume_skills = extract_additional_skills(resume_text)
                if isinstance(resume_skills, str):
                    resume_skills = [s.strip() for s in resume_skills.split(',') if s.strip()]
                resume_skills = [s for s in resume_skills if s and s.lower() != "skills"]

                score = calculate_match_score(resume_text, job_description)

                try:
                    feedback = generate_feedback(score, job_skills, resume_skills)
                except Exception:
                    feedback = f"Based on your skills {', '.join(resume_skills)}, you match {score}% with the job."

                job_results.append({
                    "id": generate_unique_id(),
                    "fileName": file_name,
                    "status": (
                        "Excellent Match" if score >= 80 else
                        "Potential" if score >= 60 else
                        "Poor Match"
                    ),
                    "matchScore": score,
                    "skills": resume_skills,
                    "feedback": feedback,
                    "firstName": first_name,
                    "lastName": last_name,
                    "email": email
                })

            except Exception as e:
                job_results.append({
                    "id": generate_unique_id(),
                    "fileName": file_name,
                    "status": "Processing Error",
                    "matchScore": 0,
                    "skills": [],
                    "processingError": True,
                    "feedback": f"Error processing file: {str(e)}"
                })

        final_output["jobMatches"].append({
            "jobId": generate_unique_id(),
            "jobFileName": jd_file,
            "title": "Unknown Title",  # Optionally extract from JD text
            "company": "Unknown Company",  # Optionally extract from JD text
            "requiredSkills": job_skills,
            "results": job_results
        })

    except Exception as e:
        print(f"❌ Error processing job description {jd_file}: {str(e)}")

# === Write to file ===
os.makedirs("outputs", exist_ok=True)
with open(OUTPUT_FILE, "w") as f:
    json.dump(final_output, f, indent=2)

print(f"✅ Matching results saved to {OUTPUT_FILE}")
