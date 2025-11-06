import re
import logging
import os
import json
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Configure via env vars for Gemini (Google GenAI)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Lazily create the GenAI client to avoid import-time failures when the
# `google.genai` package or network is not available.
_client: Optional[object] = None


def _get_client():
    """Lazily import and return a google.genai Client instance.

    This reads `GEMINI_API_KEY` at call time (not import time) so runtime
    environment updates (e.g. on hosted services) are respected.
    """
    global _client
    if _client is not None:
        return _client

    try:
        # Read the key at runtime so we don't depend on import-time envs
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            # Some SDKs also read the env variable; ensure it's present.
            os.environ["GEMINI_API_KEY"] = gemini_key

        # import lazily so this module can be imported without google-genai
        from google import genai  # type: ignore

        _client = genai.Client()
        return _client
    except Exception as exc:
        logger.exception("Failed to initialize GenAI (Gemini) client: %s", exc)
        raise


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
    """Generate a structured career roadmap using the Google GenAI (Gemini) API.

    Returns a dict with normalized keys (snake_case). Raises on any error.
    """
    system_prompt = (
        "Return EXACTLY one JSON object (no surrounding markdown) with the following keys:\n"
        "title, explanation, average_salary, job_openings, youtube_video_recommendation, learning_resources\n"
        "Where learning_resources should be an array of objects with: title, url, type (article/course/youtube)."
    )

    try:
        # Build a single prompt: system guidance followed by the user prompt
        combined_prompt = system_prompt + "\n\nUser: " + prompt

        try:
            client = _get_client()
        except Exception as e:
            if os.getenv("AI_FALLBACK", "0") == "1":
                logger.warning("GenAI unavailable, returning fallback AI response: %s", e)
                return {
                    "title": "Sample Career: Software Engineer",
                    "explanation": "A software engineer builds and maintains software systems. This is a sample response used while the AI backend is unavailable.",
                    "average_salary": "70,000 - 120,000",
                    "youtube_video_recommendation": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "learning_resources": [
                        {"title": "Learn Python", "url": "https://docs.python.org/3/tutorial/", "type": "article"},
                        {"title": "Intro to CS - course", "url": "https://www.coursera.org/", "type": "course"}
                    ],
                }
            raise

        # Use the GenAI (Gemini) text generation API
        try:
            # The google-genai client supports generate_content with a 'contents' argument
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=combined_prompt,
            )
            # response.text is the primary convenience property with the generated text
            content = getattr(response, "text", None) or str(response)
        except Exception:
            # Re-raise after logging so the outer except can handle fallback/503
            logger.exception("GenAI model request failed")
            raise

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


def check_genai_client() -> Dict[str, Any]:
    """Check whether the GenAI client can be initialized.

    Returns a dict describing status: {ok: bool, message: str, model: <model>}
    This is safe to call from a debug endpoint and helps diagnose missing
    SDK or credentials without making a model generation request.
    """
    try:
        # attempt to initialize the client; don't reassign on failure
        _get_client()
        return {"ok": True, "message": "GenAI client initialized", "model": GEMINI_MODEL}
    except Exception as exc:
        return {"ok": False, "message": f"GenAI init failed: {exc}"}