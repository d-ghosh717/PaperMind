from services.ollama_client import ask_ollama


def generate_future_work(text):

    text = text[:3000]

    prompt = f"""
You are a senior research scientist.

Suggest future research directions based on this paper.

Return markdown.

Format:

## Future Research Directions

- Direction 1
- Direction 2
- Direction 3

Research Paper:

{text}
"""

    return ask_ollama(prompt)