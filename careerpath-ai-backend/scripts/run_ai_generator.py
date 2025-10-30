"""Simple runner for `generate_career_path_with_ai`.

Usage:
  - Ensure `ollama` Python package is installed and your Ollama server (local or remote) is accessible.
  - Optionally set OLLAMA_MODEL env var to choose a different model (default: gpt-oss:120b-cloud).

Run from the repo root (or this scripts folder):
  python -m scripts.run_ai_generator

This script prints the parsed JSON output from the model.
"""
import os
import json
from app.services.ai_generator import generate_career_path_with_ai


def main():
    # Optionally override model via env var
    model = os.getenv("OLLAMA_MODEL", "gpt-oss:120b-cloud")
    print(f"Using Ollama model: {model}")

    prompt = (
        "Generate a comprehensive roadmap for the career 'Frontend Engineer'. "
        "Return the structure described in the project system prompt."
    )

    try:
        result = generate_career_path_with_ai(prompt=prompt)
        print("\nModel result (normalized):\n")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print("AI generation failed:", str(e))


if __name__ == "__main__":
    main()
