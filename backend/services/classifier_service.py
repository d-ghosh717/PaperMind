from services.ollama_client import ask_ollama


def is_research_paper(text):

    text = text[:2000]

    prompt = f"""
Determine whether this PDF content belongs to a research paper.

Return ONLY:

YES

or

NO

Text:

{text}
"""

    result = ask_ollama(prompt)

    result = result.strip().upper()

    return result.startswith("YES")