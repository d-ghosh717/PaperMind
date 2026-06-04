import requests
from requests import RequestException

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"


def ask_ollama(prompt):

    try:

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=600
        )

        response.raise_for_status()

        data = response.json()

        result = data.get("response")

        if not isinstance(result, str) or not result.strip():
            raise RuntimeError("Ollama returned an empty response.")

        return result.strip()

    except RequestException as e:

        raise RuntimeError(
            "Ollama is offline or unreachable at http://localhost:11434."
        ) from e

    except ValueError as e:

        raise RuntimeError("Ollama returned invalid JSON.") from e
