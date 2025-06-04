import os
from dotenv import load_dotenv
import openai

# Load environment variables from .env file
load_dotenv()

# Access the API key
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_follow_up(score, job_skills, resume_skills):
    try:
        # Step 1: Generate constructive feedback
        feedback_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful career advisor."},
                {"role": "user", "content": f"""
                    Generate constructive feedback for a candidate who scored {score}% match (in 3rd person).
                    Job requires: {', '.join(job_skills)}
                    Candidate has: {', '.join(resume_skills) if resume_skills else 'No listed skills'}
                """}
            ],
            temperature=0.7,
            max_tokens=200
        )
        feedback_text = feedback_response.choices[0].message.content.strip()

        # Step 2: Generate follow-up questions
        follow_up_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a technical interviewer generating follow-up interview questions."},
                {"role": "user", "content": f"""
                    Based on the following resume feedback, generate 3 thoughtful follow-up interview questions 
                    to ask the candidate. Focus on their awareness of skill gaps and their plan for upskilling.

                    Feedback:
                    \"\"\"{feedback_text}\"\"\"
                """}
            ],
            temperature=0.6,
            max_tokens=200
        )
        follow_up_questions = follow_up_response.choices[0].message.content.strip()

        return {
            "feedback": feedback_text,
            "follow_up_questions": follow_up_questions
        }

    except Exception as e:
        import traceback
        return f"Error: {str(e)}\n{traceback.format_exc()}"
