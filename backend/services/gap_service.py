from services.ollama_client import ask_ollama


def generate_research_gaps(text):

    text = text[:3000]

    prompt = f"""
You are an academic researcher.

Find research gaps from this paper.

Return markdown.

Format:

## Research Gaps

- Gap 1
- Gap 2
- Gap 3

Research Paper:

{text}
"""

    return ask_ollama(prompt)