import re
import logging
import os
import json
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Configure via env vars
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")

# Lazily create the Ollama client to avoid import-time failures when the
# `ollama` package or network is not available. Use the `host=` argument as
# expected by the installed `ollama` client to avoid passing `base_url` twice.
_client: Optional[object] = None

DEFAULT_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss:120b-cloud")


def _get_client():
    global _client
    if _client is not None:
        return _client

    try:
        # import locally so the module can be imported even when `ollama` is not installed
        # If an API key is provided via env var configuration, ensure the
        # underlying ollama.BaseClient can pick it up from the environment.
        if OLLAMA_API_KEY:
            os.environ["OLLAMA_API_KEY"] = OLLAMA_API_KEY

        from ollama import Client  # type: ignore

        # The ollama.Client expects a `host=` parameter (not `base_url=`).
        _client = Client(host=OLLAMA_BASE_URL)
        return _client
    except Exception as exc:
        logger.exception("Failed to initialize Ollama client: %s", exc)
        # Re-raise so callers can map to a 503 or similar
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
    """Generate a structured career roadmap using the Ollama chat API.

    Returns a dict with normalized keys (snake_case). Raises on any error.
    """
    system_prompt = (
        "Return EXACTLY one JSON object (no surrounding markdown) with the following keys:\n"
        "title, explanation, average_salary, job_openings, youtube_video_recommendation, learning_resources\n"
        "Where learning_resources should be an array of objects with: title, url, type (article/course/youtube)."
    )

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ]

        # Collect streaming output from Ollama (safer for long responses)
        content = ""
        try:
            try:
                client = _get_client()
            except Exception as e:
                # If enabled, return a canned fallback response for local frontend/dev testing
                if os.getenv("AI_FALLBACK", "0") == "1":
                    logger.warning("Ollama unavailable, returning fallback AI response: %s", e)
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
                # otherwise re-raise so that callers can return a 503
                raise
            for part in client.chat(DEFAULT_OLLAMA_MODEL, messages=messages, stream=True):
                # expected shape: {'message': {'role': 'assistant', 'content': '...'}}
                if not part:
                    continue
                # part may be a dict; defensively extract nested fields
                piece = None
                if isinstance(part, dict):
                    # try nested accesses
                    msg = part.get("message") or part.get("choices")
                    if isinstance(msg, dict):
                        piece = msg.get("content")
                    elif isinstance(msg, list) and len(msg) > 0:
                        # choices like [{'message': {...}}]
                        try:
                            piece = msg[0].get("message", {}).get("content")
                        except Exception:
                            piece = None
                    else:
                        # fallback: try direct content
                        piece = part.get("content")
                else:
                    # non-dict chunk (string) — append directly
                    try:
                        piece = str(part)
                    except Exception:
                        piece = None

                if piece:
                    content += piece
        except TypeError:
            # If the client.chat does not support stream=True here, call it without streaming
            # Ensure `client` is available (in case the exception came before assignment).
            if "client" not in locals() or client is None:
                client = _get_client()
            resp = client.chat(DEFAULT_OLLAMA_MODEL, messages=messages, stream=False)
            # resp can be dict-like; try to extract content defensively
            if isinstance(resp, dict):
                # common shape: {'message': {'content': '...'}}
                content = (
                    resp.get("message", {}).get("content")
                    or resp.get("choices", [{}])[0].get("message", {}).get("content", "")
                    or resp.get("content", "")
                )
            else:
                content = str(resp)

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