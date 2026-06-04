from services.ollama_client import ask_ollama


def generate_formulas(text):

    text = text[:2500]

    prompt = f"""
Analyze the document.

Find important formulas, equations,
mathematical expressions or scientific laws.

If no formulas exist return:

NO_FORMULAS_FOUND

Format:

## Formula Name

Formula

Explanation

Document:

{text}
"""

    return ask_ollama(prompt)