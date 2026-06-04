from services.ollama_client import ask_ollama


def generate_concepts(text):

    text = text[:2500]

    prompt = f"""
Extract the most important concepts from this document.

Return markdown.

Format:

## Key Concepts

### Concept Name
Short explanation

### Concept Name
Short explanation

Document:

{text}
"""

    return ask_ollama(prompt)