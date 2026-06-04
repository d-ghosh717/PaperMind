from services.ollama_client import ask_ollama


def generate_flashcards(text):

    text = text[:2500]

    prompt = f"""
Create study flashcards from this document.

Return markdown.

Format:

## Flashcards

Q: Question

A: Answer

Q: Question

A: Answer

Generate 5 to 10 flashcards.

Document:

{text}
"""

    return ask_ollama(prompt)