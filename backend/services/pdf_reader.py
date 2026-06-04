import fitz

def extract_text(pdf_path):

    text = ""

    try:

        doc = fitz.open(pdf_path)

        print("Pages:", len(doc))

        for page in doc:
            text += page.get_text()

        doc.close()

        print("Extracted Characters:", len(text))

    except Exception as e:
        print("PDF Error:", e)

    return text