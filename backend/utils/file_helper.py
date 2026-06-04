import os
import uuid


def generate_pdf_id():

    return str(uuid.uuid4())


def save_pdf(file, upload_folder):

    pdf_id = generate_pdf_id()

    filename = f"{pdf_id}.pdf"

    path = os.path.join(
        upload_folder,
        filename
    )

    file.save(path)

    return pdf_id, path