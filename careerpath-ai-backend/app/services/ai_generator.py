import os
import json
from openai import OpenAI
from typing import Dict, Any

client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

def generate_challenge_with_ai() -> Dict[str, Any]:
    system_prompt = """
    return the data in the following JSON structure
    {
    "title": "The question title",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct_answer_id": 0
    "explanation" : "Detailed explanation of why the correct answer is right"
    }
"""
    try:
        response = client.chat.completions.create(
            model = "gpt-3.5-turbo-0125",
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Generate a medium difficulty coding challenge"}
            ],
            response_format = {"type": "json_object"},
            temperature = 0.7
        )
        content = response.choices[0].message.content
        challenge_data = json.loads(content)
        required_fields = ["title", "options", "correct_answer_id", "explanation"]
        for field in required_fields:
            if field not in challenge_data:
                raise ValueError(f"Missing required field: {field}")
            
        return challenge_data
    except Exception as e:
        pass