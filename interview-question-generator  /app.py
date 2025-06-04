from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import sys
import time

# Add the current directory to the path to help Python find your modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the QuestionGenerator class
from utils.question_generator import QuestionGenerator

# Load environment variables
load_dotenv()

# Verify API key is loaded
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("WARNING: ANTHROPIC_API_KEY not found in environment variables!")
else:
    print("API key loaded successfully.")

app = Flask(__name__)
CORS(app)
question_generator = QuestionGenerator(api_key=api_key)

@app.route('/')
def index():
    return render_template('sample.html')

@app.route('/generate', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        job_role = data.get('job_role', '')
        industry = data.get('industry', '')
        experience_level = data.get('experience_level', '')
        candidate_background = data.get('candidate_background', '')
        question_count = int(data.get('question_count', 10))
        
        if not all([job_role, industry, experience_level]):
            return jsonify([{"question": "Missing required fields. Please fill in all required information."}])
        
        questions = question_generator.generate_questions(
            job_role=job_role,
            industry=industry,
            experience_level=experience_level,
            candidate_background=candidate_background,
            question_count=question_count
        )
        
        # If we got an empty list or None, return a meaningful error
        if not questions:
            return jsonify([{
                "question": "No questions could be generated. Please try different parameters.",
                "type": "General",
                "evaluates": "N/A",
                "strong_answer_example": "N/A",
                "follow_ups": ["N/A"]
            }])
        
        return jsonify(questions)
    except Exception as e:
        print(f"Error in generate_questions: {e}")
        return jsonify([{
            "question": f"An error occurred: {str(e)}",
            "type": "Error",
            "evaluates": "N/A",
            "strong_answer_example": "N/A",
            "follow_ups": ["Please try again with different parameters."]
        }])

@app.route('/follow-up', methods=['POST'])
def generate_followup():
    try:
        data = request.json
        question = data.get('question', '')
        answer = data.get('answer', '')
        
        if not question or not answer:
            return jsonify([{"follow_up_question": "Question and answer are required", "purpose": "Error handling"}])
        
        followup_questions = question_generator.generate_followup_questions(
            question=question,
            answer=answer
        )
        
        return jsonify(followup_questions)
    except Exception as e:
        print(f"Error in generate_followup: {e}")
        return jsonify([{
            "follow_up_question": f"An error occurred: {str(e)}",
            "purpose": "Error handling"
        }])
    
@app.route('/realtime-suggestions', methods=['POST'])
def get_realtime_suggestions():
    try:
        data = request.json
        job_role = data.get('job_role', '')
        discussion_context = data.get('discussion_context', '')
        interview_stage = data.get('interview_stage', 'middle')
        
        suggestions = question_generator.generate_realtime_suggestions(
            job_role=job_role,
            discussion_context=discussion_context,
            interview_stage=interview_stage
        )
        
        return jsonify(suggestions)
    except Exception as e:
        print(f"Error in get_realtime_suggestions: {e}")
        return jsonify({
            "error": str(e),
            "suggestions": ["Ask follow-up questions to get more specific examples."]
        })
@app.route('/evaluate-candidate', methods=['POST'])
def evaluate_candidate():
    try:
        data = request.json
        job_role = data.get('job_role', '')
        candidate_responses = data.get('candidate_responses', [])
        evaluation_criteria = data.get('evaluation_criteria', [])
        
        evaluation = question_generator.evaluate_candidate(
            job_role=job_role,
            candidate_responses=candidate_responses,
            evaluation_criteria=evaluation_criteria
        )
        
        return jsonify(evaluation)
    except Exception as e:
        print(f"Error in evaluate_candidate: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to evaluate candidate. Please try again."
        })
@app.route('/analyze-tone', methods=['POST'])
def analyze_tone():
    try:
        data = request.json
        candidate_response = data.get('candidate_response', '')
        
        tone_analysis = question_generator.analyze_response_tone(
            candidate_response=candidate_response
        )
        
        return jsonify(tone_analysis)
    except Exception as e:
        print(f"Error in analyze_tone: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to analyze tone. Please try again."
        })

@app.route('/save-interviewer-feedback', methods=['POST'])
def save_interviewer_feedback():
    try:
        data = request.json
        print(f"Received interviewer feedback data: {data}")  # Debug log
        
        # For development purposes, we're just returning success
        # In a real app, you would save this to a database
        
        feedback_id = f"feedback_{int(time.time())}"
        
        return jsonify({
            "success": True,
            "feedback_id": feedback_id,
            "message": "Feedback saved successfully"
        })
    except Exception as e:
        print(f"Error in save_interviewer_feedback: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to save feedback"
        }), 500  # Return HTTP 500 status code

@app.route('/save-candidate-feedback', methods=['POST'])
def save_candidate_feedback():
    try:
        data = request.json
        print(f"Received candidate feedback data: {data}")  # Debug log
        
        # For development purposes, we're just returning success
        # In a real app, you would save this to a database
        
        feedback_id = f"candidate_{int(time.time())}"
        
        return jsonify({
            "success": True,
            "feedback_id": feedback_id,
            "message": "Candidate feedback saved successfully"
        })
    except Exception as e:
        print(f"Error in save_candidate_feedback: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to save candidate feedback"
        }), 500  # Return HTTP 500 status code

@app.route('/generate-comparison-report', methods=['POST'])
def generate_comparison_report():
    try:
        data = request.json
        candidates = data.get('candidates', [])
        metrics = data.get('metrics', [])
        
        if not candidates or len(candidates) < 2:
            return jsonify({
                "error": "At least two candidates are required for comparison"
            }), 400
            
        report = question_generator.generate_comparison_report(
            candidates=candidates,
            metrics=metrics
        )
        
        return jsonify(report)
    except Exception as e:
        print(f"Error in generate_comparison_report: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to generate comparison report"
        })
if __name__ == '__main__':
    app.run(debug=True)