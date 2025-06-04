from utils.anthropic_client import AnthropicClient
import json
import re

class QuestionGenerator:
    def __init__(self, api_key):
        self.anthropic_client = AnthropicClient(api_key)
    
    def generate_questions(self, job_role, industry, experience_level, candidate_background, question_count=10):
        """
        Generate interview questions based on job role, industry, and candidate background
        """
        prompt = f"""
        Generate {question_count} interview questions for a {experience_level} {job_role} position in the {industry} industry.

        The candidate has the following background:
        {candidate_background}

        Create a mix of:
        - Role-specific technical questions that test their knowledge and skills
        - Behavioral questions relevant to this position
        - Problem-solving scenarios they might face in this role

        For each question, include:
        1. The question itself
        2. What type of question it is (technical, behavioral, problem-solving)
        3. What skill or trait you're evaluating
        4. A good example of what constitutes a strong answer
        5. 2-3 potential follow-up questions based on different possible responses

        The output MUST be a valid JSON array with no additional text before or after. Format exactly as follows:
        [
          {{
            "question": "Question text here",
            "type": "Technical",
            "evaluates": "Skill being evaluated",
            "strong_answer_example": "Example of a good answer",
            "follow_ups": ["Follow-up question 1", "Follow-up question 2"]
          }},
          // more questions...
        ]
        """
        
        response = self.anthropic_client.generate_content(prompt)
        
        # Try to parse JSON from the response
        try:
            # First, look for JSON array in the response
            json_match = re.search(r'\[\s*\{.*\}\s*\]', response, re.DOTALL)
            
            if json_match:
                json_content = json_match.group(0)
                try:
                    questions = json.loads(json_content)
                    return questions
                except json.JSONDecodeError:
                    pass  # If this fails, we'll try the alternative approaches below
            
            # If no valid JSON array was found, try to extract JSON manually
            json_start = response.find("[")
            json_end = response.rfind("]") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_content = response[json_start:json_end]
                try:
                    questions = json.loads(json_content)
                    return questions
                except json.JSONDecodeError:
                    # If JSON still can't be parsed, create structured response manually
                    questions = []
                    # Simple extraction of question parts (basic fallback)
                    parts = response.split("Question")
                    for part in parts[1:]:  # Skip the first empty part
                        question_text = part.split("\n")[0].strip(": ")
                        if question_text:
                            question_obj = {
                                "question": f"Question{question_text}",
                                "type": "General",
                                "evaluates": "General skills",
                                "strong_answer_example": "Please provide a comprehensive answer based on your experience.",
                                "follow_ups": ["Could you elaborate more on that?", "What specific example can you share?"]
                            }
                            questions.append(question_obj)
                    
                    if questions:
                        return questions
            
            # Last resort - generate a simple fallback response with the raw content
            return [{
                "question": "The AI generated content in a format that couldn't be parsed. Please try again.",
                "type": "General",
                "evaluates": "N/A",
                "strong_answer_example": response[:500] + "..." if len(response) > 500 else response,
                "follow_ups": ["Please try regenerating with different parameters."]
            }]
        
        except Exception as e:
            print(f"Error parsing questions: {e}")
            return [{
                "question": f"Error generating questions: {str(e)}. Please try again with different parameters.",
                "type": "General",
                "evaluates": "N/A",
                "strong_answer_example": "N/A",
                "follow_ups": ["N/A"]
            }]
    
    def generate_followup_questions(self, question, answer, count=3):
        """
        Generate follow-up questions based on the candidate's answer
        """
        prompt = f"""
        In an interview, the candidate was asked:
        "{question}"
        
        Their answer was:
        "{answer}"
        
        Please generate {count} insightful follow-up questions that would help evaluate the candidate more deeply based on their response.
        For each follow-up question, explain what additional information you're trying to uncover.
        
        Return the results as a JSON array with no additional text before or after, exactly in this format:
        [
          {{
            "follow_up_question": "First follow-up question here",
            "purpose": "What this question helps evaluate"
          }},
          {{
            "follow_up_question": "Second follow-up question here",
            "purpose": "What this question helps evaluate"
          }},
          // more follow-up questions...
        ]
        """
        
        response = self.anthropic_client.generate_content(prompt)
        
        # Parse follow-up questions
        try:
            # Try to find and extract JSON
            json_match = re.search(r'\[\s*\{.*\}\s*\]', response, re.DOTALL)
            
            if json_match:
                json_content = json_match.group(0)
                follow_ups = json.loads(json_content)
                return follow_ups
            
            # Alternative approach if regex fails
            json_start = response.find("[")
            json_end = response.rfind("]") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_content = response[json_start:json_end]
                follow_ups = json.loads(json_content)
                return follow_ups
            else:
                # Fallback with default follow-ups
                return [
                    {"follow_up_question": "Could you elaborate more on your experience?", "purpose": "Get more detailed information"},
                    {"follow_up_question": "What specific challenges did you face during this?", "purpose": "Assess problem-solving skills"},
                    {"follow_up_question": "How did this experience change your approach?", "purpose": "Evaluate self-reflection and growth"}
                ]
        except json.JSONDecodeError:
            # Default follow-ups if JSON parsing fails
            return [
                {"follow_up_question": "Could you elaborate more on your experience?", "purpose": "Get more detailed information"},
                {"follow_up_question": "What specific challenges did you face during this?", "purpose": "Assess problem-solving skills"},
                {"follow_up_question": "How did this experience change your approach?", "purpose": "Evaluate self-reflection and growth"}
            ]
        
    def generate_realtime_suggestions(self, job_role, discussion_context, interview_stage='middle'):
    
        prompt = f"""
        You are an expert interview coach giving real-time suggestions to an interviewer.

        Job Role: {job_role}
        Current Interview Stage: {interview_stage}
    
        Recent Interview Conversation:
        "{discussion_context}"
    
        Based on this conversation, provide:
        1. Three tactical suggestions for what the interviewer should ask or probe into next
        2. Key skills or experiences that haven't been covered yet
        3. Areas where the candidate's answers could be probed more deeply
    
        Return your suggestions as a JSON object with no additional text before or after:
        {{
        "next_questions": ["suggestion 1", "suggestion 2", "suggestion 3"],
        "uncovered_areas": ["area 1", "area 2"],
        "probe_deeper": ["topic 1", "topic 2"]
        }}
        """
    
        response = self.anthropic_client.generate_content(prompt)
    
        try:
         # Try to find and extract JSON using regex
            import re
            json_match = re.search(r'\{(?:\s|.)*\}', response, re.DOTALL)
        
            if json_match:
                json_str = json_match.group(0)
                suggestions = json.loads(json_str)
                return suggestions
        
            # Fallback parsing
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
        
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                try:
                    suggestions = json.loads(json_str)
                    return suggestions
                except json.JSONDecodeError:
                    pass
        
            # Last resort fallback
            return {
                "next_questions": [
                    "Ask about specific challenges they've faced in this role",
                    "Inquire about their experience with relevant technologies/tools",
                    "Ask about their teamwork and collaboration style"
                ],
                "uncovered_areas": [
                    "Leadership experience",
                    "Problem-solving approach"
                ],
                "probe_deeper": [
                    "Get more specific examples",
                    "Ask about measurable results"
                ]
            }
        except Exception as e:
            print(f"Error parsing real-time suggestions: {e}")
            return {
                "next_questions": [
                    "Ask about specific challenges they've faced in this role",
                    "Inquire about their experience with relevant technologies/tools",
                    "Ask about their teamwork and collaboration style"
                ],
                "uncovered_areas": [
                    "Leadership experience",
                    "Problem-solving approach"
                ],
                "probe_deeper": [
                    "Get more specific examples",
                    "Ask about measurable results"
                ]
            }
    def evaluate_candidate(self, job_role, candidate_responses, evaluation_criteria=None):
        """
        Evaluate a candidate based on their interview responses.
        
        Args:
            job_role: The position the candidate is interviewing for
            candidate_responses: List of dictionaries containing questions and answers
            evaluation_criteria: Optional list of specific criteria to evaluate
        
        Returns:
            Dictionary containing evaluation scores and feedback
        """
        if evaluation_criteria is None or len(evaluation_criteria) == 0:
            evaluation_criteria = [
                "Technical Competence",
                "Communication Skills",
                "Problem-Solving Ability",
                "Cultural Fit",
                "Leadership Potential"
            ]
        
        # Format candidate responses for the prompt
        formatted_responses = ""
        for i, response in enumerate(candidate_responses):
            formatted_responses += f"Q{i+1}: {response.get('question', '')}\n"
            formatted_responses += f"A{i+1}: {response.get('answer', '')}\n\n"
        
        # Format evaluation criteria for the prompt
        formatted_criteria = ", ".join(evaluation_criteria)
        
        prompt = f"""
        You are an expert interviewer evaluating a candidate for a {job_role} position.
        
        Please evaluate the candidate based on the following interview responses:
        
        {formatted_responses}
        
        Evaluate the candidate on the following criteria (score 1-5, where 1 is poor and 5 is excellent):
        {formatted_criteria}
        
        For each criterion, provide:
        1. A numerical score (1-5)
        2. Specific evidence from their responses
        3. Suggestions for improvement
        
        Then provide an overall assessment including:
        1. The candidate's key strengths
        2. Areas for improvement
        3. Overall fit for the role (Not Suitable, Potential Fit, Good Fit, Excellent Fit)
        
        Return your evaluation as a JSON object with no additional text before or after:
        {{
        "scores": [
            {{
            "criterion": "criterion name",
            "score": score,
            "evidence": "evidence from responses",
            "improvement": "suggestion for improvement"
            }},
            // more criteria...
        ],
        "overall_assessment": {{
            "strengths": ["strength 1", "strength 2"],
            "areas_for_improvement": ["area 1", "area 2"],
            "overall_fit": "category"
        }}
        }}
        """
        
        response = self.anthropic_client.generate_content(prompt, max_tokens=2500)
        
        try:
            # Try to find and extract JSON using regex
            import re
            json_match = re.search(r'\{(?:\s|.)*\}', response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(0)
                evaluation = json.loads(json_str)
                return evaluation
            
            # Fallback parsing
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                try:
                    evaluation = json.loads(json_str)
                    return evaluation
                except json.JSONDecodeError:
                    pass
            
            # If parsing fails, return an error message
            return {
                "error": "Failed to parse evaluation",
                "raw_response": response[:1000]  # First 1000 chars for debugging
            }
        except Exception as e:
            print(f"Error parsing candidate evaluation: {e}")
            return {
                "error": str(e),
                "message": "Failed to evaluate candidate"
            }
        
    def analyze_response_tone(self, candidate_response):
        """
        Analyze the tone of a candidate's response to provide insights on
        communication style and emotional intelligence.
        
        Args:
            candidate_response: The text of the candidate's response
        
        Returns:
            Dictionary containing tone analysis
        """
        prompt = f"""
        As an expert in communication and emotional intelligence, analyze the tone and language
        patterns in this candidate's interview response:
        
        "{candidate_response}"
        
        Provide a comprehensive analysis covering:
        1. Overall tone (confidence, uncertainty, enthusiasm, etc.)
        2. Language patterns (concrete vs. abstract, passive vs. active, etc.)
        3. Emotional intelligence indicators
        4. Communication effectiveness
        5. Authenticity assessment
        
        For each area, provide:
        - A rating on a scale of 1-5
        - Specific evidence from the text
        - Implications for workplace communication
        
        Return your analysis as a JSON object with no additional text before or after:
        {{
        "tone": {{
            "primary_tones": ["tone1", "tone2"],
            "confidence_level": score,
            "enthusiasm": score,
            "evidence": "specific language indicating tone"
        }},
        "language_patterns": {{
            "concreteness": score,
            "specificity": score,
            "active_voice": score,
            "evidence": "examples from text"
        }},
        "emotional_intelligence": {{
            "self_awareness": score,
            "empathy": score,
            "evidence": "indicators from response"
        }},
        "communication_effectiveness": {{
            "clarity": score,
            "organization": score,
            "persuasiveness": score,
            "evidence": "examples from text"
        }},
        "authenticity": {{
            "score": score,
            "evidence": "indicators of authenticity or lack thereof"
        }},
        "overall_impression": "summary statement"
        }}
        """
        
        response = self.anthropic_client.generate_content(prompt)
        
        try:
            # Try to find and extract JSON using regex
            import re
            json_match = re.search(r'\{(?:\s|.)*\}', response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(0)
                analysis = json.loads(json_str)
                return analysis
            
            # Fallback parsing
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                try:
                    analysis = json.loads(json_str)
                    return analysis
                except json.JSONDecodeError:
                    pass
            
            # If parsing fails, return an error message
            return {
                "error": "Failed to parse tone analysis",
                "overall_impression": "The response shows a neutral tone with basic communication skills."
            }
        except Exception as e:
            print(f"Error parsing tone analysis: {e}")
            return {
                "error": str(e),
                "message": "Failed to analyze tone"
            }
        
    def generate_comparison_report(self, candidates, metrics=None):
        """
        Generate a comparison report between multiple candidates.
        
        Args:
            candidates: List of candidate objects with their evaluation data
            metrics: Optional list of specific metrics to focus on
        
        Returns:
            Dictionary containing comparative analysis
        """
        if metrics is None or len(metrics) == 0:
            metrics = ["Technical Skills", "Communication", "Problem Solving", 
                    "Cultural Fit", "Experience", "Leadership"]
        
        # Format candidate data for the prompt
        candidates_text = ""
        for i, candidate in enumerate(candidates):
            candidates_text += f"Candidate {i+1}: {candidate.get('name', f'Candidate {i+1}')}\n"
            candidates_text += f"Position: {candidate.get('position', 'Not specified')}\n"
            candidates_text += f"Feedback Summary: {candidate.get('feedback', 'No feedback provided')}\n"
            
            if 'scores' in candidate:
                candidates_text += "Scores:\n"
                for score in candidate['scores']:
                    candidates_text += f"- {score.get('criterion', 'Criterion')}: {score.get('score', 'N/A')}/5\n"
                    
            if 'strengths' in candidate:
                candidates_text += "Strengths: " + ", ".join(candidate['strengths']) + "\n"
                
            if 'weaknesses' in candidate:
                candidates_text += "Areas for Improvement: " + ", ".join(candidate['weaknesses']) + "\n"
                
            candidates_text += "\n"
        
        # Format metrics for the prompt
        metrics_text = ", ".join(metrics)
        
        prompt = f"""
        You are an expert hiring manager creating a comparative analysis report between multiple candidates.
        
        Please compare the following candidates:
        
        {candidates_text}
        
        Focus your comparison on these key metrics:
        {metrics_text}
        
        For each metric, indicate which candidate ranks highest and why. Then provide:
        1. A side-by-side comparison table of all candidates across all metrics
        2. Key differentiators between candidates
        3. A ranked recommendation of which candidate(s) should move forward
        
        Return your analysis as a JSON object with no additional text before or after:
        {{
        "metrics_comparison": [
            {{
            "metric": "metric name",
            "rankings": [
                {{ "rank": 1, "candidate": "Candidate Name", "score": score, "notes": "why they ranked here" }},
                // more rankings...
            ]
            }},
            // more metrics...
        ],
        "key_differentiators": [
            {{ "candidate": "Candidate Name", "differentiators": ["point 1", "point 2"] }},
            // more candidates...
        ],
        "recommendations": [
            {{ "rank": 1, "candidate": "Candidate Name", "rationale": "why they're recommended" }},
            // more recommendations...
        ],
        "summary": "overall summary of the comparison"
        }}
        """
        
        response = self.anthropic_client.generate_content(prompt, max_tokens=3000)
        
        try:
            # Extract JSON from response
            import re
            json_match = re.search(r'\{(?:\s|.)*\}', response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(0)
                report = json.loads(json_str)
                return report
            
            # Fallback parsing
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                try:
                    report = json.loads(json_str)
                    return report
                except json.JSONDecodeError:
                    pass
            
            # If parsing fails, return an error message
            return {
                "error": "Failed to generate comparison report",
                "raw_response": response[:1000]  # First 1000 chars for debugging
            }
        except Exception as e:
            print(f"Error parsing comparison report: {e}")
            return {
                "error": str(e),
                "message": "Failed to generate comparison report"
            }
        