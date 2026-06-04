import fitz

from utils.text_cleaner import clean_text


def extract_text(pdf_path):

    text = ""

    doc = fitz.open(pdf_path)

    for page in doc:

        text += page.get_text()

    doc.close()

    return clean_text(text)