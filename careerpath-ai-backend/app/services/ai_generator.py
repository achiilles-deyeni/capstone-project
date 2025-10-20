import re
import logging
import os
import json
from openai import OpenAI
from typing import Dict, Any, List

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _extract_json_blob(text: str) -> str:
    """Extract the first JSON object from text, or return the original text.

    This strips surrounding markdown/code fences and explanatory text when possible.
    """
    if not text:
        return text
    # remove common fencing like ```json
    text = re.sub(r"^\s*```(?:json)?\n", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n```\s*$", "", text)

    m = re.search(r"\{[\s\S]*\}", text)
    return m.group(0) if m else text


def _normalize_keys(d: Dict[str, Any]) -> Dict[str, Any]:
    def to_snake(s: str) -> str:
        return re.sub(r"[^0-9a-zA-Z]+", "_", s.strip()).lower()

    return {to_snake(k): v for k, v in d.items()}


def generate_career_path_with_ai(prompt: str = "Generate a comprehensive roadmap for the selected career") -> Dict[str, Any]:
    """Generate a structured career roadmap using the OpenAI chat completion.

    Returns a dict with normalized keys (snake_case). Raises on any error.
    """
    system_prompt = (
        "Return EXACTLY one JSON object (no surrounding markdown) with the following keys:\n"
        "title, explanation, average_salary, job_openings, youtube_video_recommendation, learning_resources\n"
        "Where learning_resources should be an array of objects with: title, url, type (article/course/youtube)."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=800,
        )

        # defensive extraction for different client shapes
        content = None
        try:
            content = response.choices[0].message.content
        except Exception:
            try:
                content = response.choices[0]["message"]["content"]
            except Exception:
                content = getattr(response.choices[0], "text", None)

        if not content:
            raise ValueError("No content returned from model")

        blob = _extract_json_blob(content)

        try:
            parsed = json.loads(blob)
        except json.JSONDecodeError:
            # Try a forgiving replacement of single quotes to double quotes
            try:
                parsed = json.loads(blob.replace("'", '"'))
            except Exception as jerr:
                logger.debug("Failed to parse JSON blob: %s", blob)
                raise jerr

        if not isinstance(parsed, dict):
            raise ValueError("Model did not return a JSON object")

        normalized = _normalize_keys(parsed)

        # Ensure learning_resources is a list
        if "learning_resources" in normalized and not isinstance(normalized["learning_resources"], list):
            normalized["learning_resources"] = [normalized["learning_resources"]]

        required = ["title", "explanation", "average_salary", "youtube_video_recommendation"]
        missing: List[str] = [r for r in required if r not in normalized or not normalized[r]]
        if missing:
            raise ValueError(f"Missing required fields from model output: {missing}")

        # Provide a default empty list for learning_resources if absent
        if "learning_resources" not in normalized:
            normalized["learning_resources"] = []

        return normalized

    except Exception as exc:
        logger.exception("Failed to generate challenge with AI: %s", exc)
        raise