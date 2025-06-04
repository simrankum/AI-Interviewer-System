import anthropic

class AnthropicClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-2.1"  # Using Claude 2.1 for best results
    
    def generate_content(self, prompt, max_tokens=2000):
        """
        Generate content using Anthropic's Claude model
        """
        try:
            system_prompt = """
            You are an expert in creating job interview questions. 
            When generating questions, you must return them in valid JSON format.
            Do not include any explanations, markdown formatting, or text outside of the JSON structure.
            Check that your output is valid, well-formed JSON before returning it.
            """
            
            response = self.client.completions.create(
                model=self.model,
                prompt=anthropic.HUMAN_PROMPT + prompt + anthropic.AI_PROMPT,
                max_tokens_to_sample=max_tokens,
                temperature=0.7
            )
            return response.completion.strip()
        except Exception as e:
            print(f"Error when calling Anthropic API: {e}")
            return "Sorry, I couldn't generate questions at this time."