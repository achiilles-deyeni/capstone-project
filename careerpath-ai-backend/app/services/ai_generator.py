import re
import logging
import os
import json
import threading
from typing import Dict, Any, List, Optional
from functools import lru_cache

logger = logging.getLogger(__name__)

# Configure via env vars for Gemini (Google GenAI)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_PROMPT_LENGTH = int(os.getenv("MAX_PROMPT_LENGTH", "2000"))

# Thread-local storage for client instances
_thread_local = threading.local()


def _get_client():
    """Lazily import and return a google.genai Client instance (thread-safe).

    This reads `GEMINI_API_KEY` at call time (not import time) so runtime
    environment updates (e.g. on hosted services) are respected.
    """
    # Check if this thread already has a client
    if hasattr(_thread_local, 'client') and _thread_local.client is not None:
        return _thread_local.client

    try:
        # Read the key at runtime so we don't depend on import-time envs
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        # Some SDKs also read the env variable; ensure it's present.
        os.environ["GEMINI_API_KEY"] = gemini_key

        # import lazily so this module can be imported without google-genai
        from google import genai  # type: ignore

        _thread_local.client = genai.Client()
        return _thread_local.client
    except Exception as exc:
        logger.exception("Failed to initialize GenAI (Gemini) client: %s", exc)
        raise


def _sanitize_prompt(prompt: str) -> str:
    """Sanitize and validate user input prompt.
    
    Args:
        prompt: Raw user input
        
    Returns:
        Sanitized prompt string
        
    Raises:
        ValueError: If prompt is invalid
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")
    
    # Remove any null bytes or control characters except newlines/tabs
    sanitized = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', prompt)
    
    # Trim whitespace
    sanitized = sanitized.strip()
    
    # Check length
    if len(sanitized) > MAX_PROMPT_LENGTH:
        raise ValueError(f"Prompt exceeds maximum length of {MAX_PROMPT_LENGTH} characters")
    
    # Warn if prompt contains potential injection attempts
    suspicious_patterns = [
        r'ignore\s+previous\s+instructions',
        r'system\s*:',
        r'<\|im_start\|>',
        r'###\s*instruction',
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, sanitized, re.IGNORECASE):
            logger.warning("Potentially suspicious prompt detected: %s", sanitized[:100])
            break
    
    return sanitized


def _extract_json_blob(text: str) -> str:
    """Extract the first JSON object from text, or return the original text.

    This strips surrounding markdown/code fences and explanatory text when possible.
    """
    if not text:
        return text
    
    # Remove common fencing like ```json or ```
    text = re.sub(r"^\s*```(?:json)?\s*\n", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n\s*```\s*$", "", text)
    
    # Try to find a JSON object
    m = re.search(r"\{[\s\S]*\}", text)
    return m.group(0) if m else text


def _normalize_keys(d: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize dictionary keys to snake_case."""
    def to_snake(s: str) -> str:
        # Handle camelCase and spaces/special chars
        s = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s)
        return re.sub(r"[^0-9a-zA-Z]+", "_", s.strip()).lower().strip('_')

    return {to_snake(k): v for k, v in d.items()}


def _parse_json_safely(blob: str) -> Dict[str, Any]:
    """Attempt to parse JSON with multiple fallback strategies.
    
    Args:
        blob: String containing potential JSON
        
    Returns:
        Parsed dictionary
        
    Raises:
        json.JSONDecodeError: If all parsing attempts fail
    """
    # Strategy 1: Direct parse
    try:
        return json.loads(blob)
    except json.JSONDecodeError:
        pass
    
    # Strategy 2: Fix common issues (unescaped quotes in strings)
    try:
        # Only replace single quotes that are likely meant as double quotes
        # This is a heuristic and may not work in all cases
        fixed = blob.replace("'", '"')
        result = json.loads(fixed)
        logger.warning("JSON parsed using single-quote replacement fallback")
        return result
    except json.JSONDecodeError:
        pass
    
    # Strategy 3: Try to extract just the object part more aggressively
    try:
        # Find content between outermost braces
        match = re.search(r'\{(?:[^{}]|(?:\{[^{}]*\}))*\}', blob, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except (json.JSONDecodeError, AttributeError):
        pass
    
    # All strategies failed
    logger.error("Failed to parse JSON blob: %s", blob[:500])
    raise json.JSONDecodeError("Unable to parse model response as JSON", blob, 0)


@lru_cache(maxsize=100)
def _get_fallback_data(career_type: str = "Software Engineer") -> Dict[str, Any]:
    """Get cached fallback data for when AI is unavailable.
    
    Args:
        career_type: Type of career for the fallback
        
    Returns:
        Dictionary with sample career data
    """
    return {
        "title": f"Sample Career: {career_type}",
        "explanation": f"A {career_type.lower()} is a professional who works in this field. "
                      "This is a sample response used while the AI backend is unavailable. "
                      "Please try again later for a comprehensive, AI-generated career roadmap.",
        "average_salary": "$60,000 - $120,000",
        "job_openings": "Moderate to High demand",
        "youtube_video_recommendation": "https://www.youtube.com/results?search_query=" + 
                                       career_type.replace(" ", "+"),
        "learning_resources": [
            {
                "title": f"Introduction to {career_type}",
                "url": "https://www.coursera.org/",
                "type": "course"
            },
            {
                "title": f"{career_type} Career Guide",
                "url": "https://www.indeed.com/career-advice",
                "type": "article"
            },
            {
                "title": f"Learn {career_type} Skills",
                "url": "https://www.udemy.com/",
                "type": "course"
            }
        ],
    }


def generate_career_path_with_ai(
    prompt: str = "Generate a comprehensive roadmap for the selected career"
) -> Dict[str, Any]:
    """Generate a structured career roadmap using the Google GenAI (Gemini) API.

    Args:
        prompt: User's career-related query
        
    Returns:
        Dictionary with normalized keys (snake_case) containing:
        - title: Career title
        - explanation: Detailed description
        - average_salary: Salary range
        - job_openings: Job market information
        - youtube_video_recommendation: Relevant video URL
        - learning_resources: List of learning materials
        
    Raises:
        ValueError: If prompt is invalid or required fields are missing
        Exception: For API or network errors
    """
    # Validate and sanitize input
    try:
        sanitized_prompt = _sanitize_prompt(prompt)
    except ValueError as e:
        logger.error("Invalid prompt: %s", e)
        raise
    
    system_prompt = (
        "You are a career counseling AI. Return EXACTLY one valid JSON object "
        "(no markdown fences, no additional text) with these keys:\n"
        "- title: string (career title)\n"
        "- explanation: string (comprehensive description, 2-3 paragraphs)\n"
        "- average_salary: string (salary range with currency)\n"
        "- job_openings: string (current job market status)\n"
        "- youtube_video_recommendation: string (valid YouTube URL)\n"
        "- learning_resources: array of objects, each with:\n"
        "  * title: string\n"
        "  * url: string (valid URL)\n"
        "  * type: string (one of: 'article', 'course', 'youtube', 'book')\n\n"
        "Ensure all URLs are valid and all fields are properly filled."
    )

    try:
        # Build the combined prompt
        combined_prompt = f"{system_prompt}\n\nUser Query: {sanitized_prompt}"

        # Get the client
        try:
            client = _get_client()
        except Exception as e:
            if os.getenv("AI_FALLBACK", "0") == "1":
                logger.warning("GenAI unavailable, returning fallback: %s", e)
                # Extract potential career name from prompt for better fallback
                career_match = re.search(r'(?:career|job|role|position)[\s:]+([a-zA-Z\s]+)', 
                                        sanitized_prompt, re.IGNORECASE)
                career_name = career_match.group(1).strip() if career_match else "Software Engineer"
                return _get_fallback_data(career_name)
            raise

        # Call the GenAI API
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=combined_prompt,
            )
            content = getattr(response, "text", None) or str(response)
        except Exception as api_error:
            logger.exception("GenAI model request failed: %s", api_error)
            if os.getenv("AI_FALLBACK", "0") == "1":
                return _get_fallback_data()
            raise

        if not content:
            raise ValueError("No content returned from model")

        # Extract and parse JSON
        blob = _extract_json_blob(content)
        parsed = _parse_json_safely(blob)

        if not isinstance(parsed, dict):
            raise ValueError("Model did not return a JSON object")

        # Normalize keys
        normalized = _normalize_keys(parsed)

        # Ensure learning_resources is a list
        if "learning_resources" in normalized:
            if not isinstance(normalized["learning_resources"], list):
                normalized["learning_resources"] = [normalized["learning_resources"]]
        else:
            normalized["learning_resources"] = []

        # Validate required fields
        required = [
            "title",
            "explanation",
            "average_salary",
            "job_openings",
            "youtube_video_recommendation"
        ]
        missing = [r for r in required if r not in normalized or not normalized[r]]
        
        if missing:
            raise ValueError(f"Missing required fields from model output: {missing}")

        # Validate URLs in learning resources
        for resource in normalized.get("learning_resources", []):
            if not isinstance(resource, dict):
                logger.warning("Invalid learning resource format: %s", resource)
                continue
            if "url" in resource and resource["url"]:
                # Basic URL validation
                if not re.match(r'https?://', resource["url"], re.IGNORECASE):
                    logger.warning("Invalid URL in learning resource: %s", resource["url"])

        return normalized

    except Exception as exc:
        logger.exception("Failed to generate career path with AI: %s", exc)
        raise


def check_genai_client() -> Dict[str, Any]:
    """Check whether the GenAI client can be initialized.

    Returns:
        Dictionary with status information:
        - ok: bool (whether client initialized successfully)
        - message: str (status message)
        - model: str (model name if successful)
        - fallback_enabled: bool (whether fallback mode is enabled)
    """
    result = {
        "ok": False,
        "message": "",
        "model": GEMINI_MODEL,
        "fallback_enabled": os.getenv("AI_FALLBACK", "0") == "1"
    }
    
    try:
        _get_client()
        result["ok"] = True
        result["message"] = "GenAI client initialized successfully"
    except Exception as exc:
        result["message"] = f"GenAI initialization failed: {str(exc)}"
        logger.error("Health check failed: %s", exc)
    
    return result