import os
from dotenv import load_dotenv
import openai

# Load environment variables from .env file
load_dotenv()

# Access the API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

from openai import OpenAI

client = OpenAI()  # Automatically uses OPENAI_API_KEY from environment

def generate_feedback(score, job_skills, resume_skills):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful career advisor."},
                {"role": "user", "content": f"""
                Generate constructive feedback for a candidate who scored {score}% match(in 3rd person)
                Job requires: {', '.join(job_skills)}
                Candidate has: {', '.join(resume_skills) if resume_skills else 'No listed skills'}
                """}
            ],
            temperature=0.7,
            max_tokens=200
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"AI Feedback Error: {str(e)}"