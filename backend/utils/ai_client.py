import ollama
import json

# Define the model name here so other files (like resume_score.py) can import it
MODEL_NAME = "llama3:8b" 

def generate_question(role, experience, focus, resume):
    # Refining the prompt to force JSON and prevent "yapping" from the AI
    prompt = f"""
    You are a professional technical interviewer.
    Role: {role}
    Experience Level: {experience}
    Focus Area: {focus}
    Candidate Resume Context: {resume[:500]}

    Return ONLY a valid JSON object. Do not include any introductory text or markdown formatting.
    Structure:
    {{
    "title": "Question Title",
    "description": "The actual interview question text",
    "input_format": "text or code",
    "output_format": "text or code"
    }}
    """

    try:
        response = ollama.chat(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            options={
                "temperature": 0.7, # Adds a bit of variety to questions
            }
        )

        content = response["message"]["content"]

        # Extract JSON from potential markdown backticks
        start = content.find("{")
        end = content.rfind("}")

        if start == -1 or end == -1:
            raise Exception("No JSON object found in response")

        json_str = content[start:end+1]
        return json.loads(json_str)

    except Exception as e:
        print(f"OLLAMA FAILURE on model {MODEL_NAME}:", str(e))
        # Robust fallback so the frontend doesn't crash
        return {
            "title": "Technical Introduction",
            "description": f"Based on your interest in {focus}, describe a challenging project you've worked on recently.",
            "input_format": "text",
            "output_format": "text"
        }

# Adding a generic client wrapper if you want to use it like a class elsewhere
class AIClient:
    def __init__(self):
        self.model = MODEL_NAME
    
    def chat(self, messages):
        return ollama.chat(model=self.model, messages=messages)

client = AIClient()