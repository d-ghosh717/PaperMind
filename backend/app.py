from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from config import CACHE_FOLDER, UPLOAD_FOLDER

from pdf_reader import extract_text

from utils.file_helper import save_pdf
from utils.cache_manager import load_cache, save_cache

from services.summary_service import generate_summary
from services.concepts_service import generate_concepts
from services.formula_service import generate_formulas
from services.flashcard_service import generate_flashcards

from services.classifier_service import is_research_paper
from services.limitation_service import generate_limitations
from services.gap_service import generate_research_gaps
from services.futurework_service import generate_future_work


app = Flask(__name__)
CORS(app)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)
os.makedirs(
    CACHE_FOLDER,
    exist_ok=True
)


def cache_path(pdf_id, response_key):

    return os.path.join(
        CACHE_FOLDER,
        pdf_id,
        f"{response_key}.json"
    )


def get_pdf_text(pdf_id):

    pdf_path = os.path.join(
        UPLOAD_FOLDER,
        f"{pdf_id}.pdf"
    )

    if not os.path.exists(pdf_path):
        return None

    return extract_text(pdf_path)


def load_pdf_text(pdf_id):

    if not pdf_id:

        return None, (
            jsonify({
                "error": "Missing PDF id"
            }),
            400
        )

    text = get_pdf_text(pdf_id)

    if text is None:

        return None, (
            jsonify({
                "error": "PDF not found"
            }),
            404
        )

    if not text.strip():

        return None, (
            jsonify({
                "error": "No extractable text was found in this PDF"
            }),
            422
        )

    return text, None


def run_ai_endpoint(pdf_id, response_key, generator):

    text, error_response = load_pdf_text(pdf_id)

    if error_response:

        return error_response

    cached = load_cache(
        cache_path(
            pdf_id,
            response_key
        )
    )

    if cached is not None:

        return jsonify(cached)

    try:

        result = generator(text)

    except RuntimeError as e:

        return jsonify({
            "error": str(e)
        }), 502

    except Exception as e:

        return jsonify({
            "error": f"Failed to generate {response_key}: {str(e)}"
        }), 500

    if not isinstance(result, str) or not result.strip():

        return jsonify({
            "error": f"{response_key} returned an empty AI response"
        }), 502

    payload = {
        response_key: result
    }

    save_cache(
        cache_path(
            pdf_id,
            response_key
        ),
        payload
    )

    return jsonify(payload)


@app.route("/")
def home():

    return jsonify({
        "status": "running",
        "project": "ResearchLens"
    })


@app.route("/upload", methods=["POST"])
def upload_pdf():

    try:

        if "file" not in request.files:

            return jsonify({
                "error": "No file uploaded"
            }), 400

        file = request.files["file"]

        if file.filename == "":

            return jsonify({
                "error": "No file selected"
            }), 400

        if not file.filename.lower().endswith(".pdf"):

            return jsonify({
                "error": "Only PDF files are supported"
            }), 400

        pdf_id, path = save_pdf(
            file,
            UPLOAD_FOLDER
        )

        return jsonify({
            "success": True,
            "pdf_id": pdf_id
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


@app.route("/summary/<pdf_id>", methods=["GET"])
def summary(pdf_id):

    return run_ai_endpoint(
        pdf_id,
        "summary",
        generate_summary
    )


@app.route("/concepts/<pdf_id>", methods=["GET"])
def concepts(pdf_id):

    return run_ai_endpoint(
        pdf_id,
        "concepts",
        generate_concepts
    )


@app.route("/formulas/<pdf_id>", methods=["GET"])
def formulas(pdf_id):

    return run_ai_endpoint(
        pdf_id,
        "formulas",
        generate_formulas
    )


@app.route("/flashcards/<pdf_id>", methods=["GET"])
def flashcards(pdf_id):

    return run_ai_endpoint(
        pdf_id,
        "flashcards",
        generate_flashcards
    )


@app.route("/research/<pdf_id>", methods=["GET"])
def research(pdf_id):

    text, error_response = load_pdf_text(pdf_id)

    if error_response:

        return error_response

    cached = load_cache(
        cache_path(
            pdf_id,
            "research"
        )
    )

    if cached is not None:

        return jsonify(cached)

    try:

        research_paper = is_research_paper(text)

    except RuntimeError as e:

        return jsonify({
            "error": str(e)
        }), 502

    except Exception as e:

        return jsonify({
            "error": f"Failed to classify document: {str(e)}"
        }), 500

    if not research_paper:

        payload = {
            "isResearchPaper": False
        }

        save_cache(
            cache_path(
                pdf_id,
                "research"
            ),
            payload
        )

        return jsonify(payload)

    try:

        limitations = generate_limitations(text)

        gaps = generate_research_gaps(text)

        future_work = generate_future_work(text)

    except RuntimeError as e:

        return jsonify({
            "error": str(e)
        }), 502

    except Exception as e:

        return jsonify({
            "error": f"Failed to generate research analysis: {str(e)}"
        }), 500

    if (
        not isinstance(limitations, str) or not limitations.strip()
        or not isinstance(gaps, str) or not gaps.strip()
        or not isinstance(future_work, str) or not future_work.strip()
    ):

        return jsonify({
            "error": "Research analysis returned an empty AI response"
        }), 502

    payload = {
        "isResearchPaper": True,
        "limitations": limitations,
        "gaps": gaps,
        "future_work": future_work
    }

    save_cache(
        cache_path(
            pdf_id,
            "research"
        ),
        payload
    )

    return jsonify(payload)


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
