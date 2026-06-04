from services.ollama_client import ask_ollama


def generate_limitations(text):

    text = text[:3000]

    prompt = f"""
You are a research paper reviewer.

Identify the limitations of this research.

Return markdown.

Format:

## Limitations

- Limitation 1
- Limitation 2
- Limitation 3

Research Paper:

{text}
"""

    return ask_ollama(prompt)