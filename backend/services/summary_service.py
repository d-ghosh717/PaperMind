from services.ollama_client import ask_ollama


def generate_summary(text):

    text = text[:3000]

    prompt = f"""
You are an expert document analyst.

Create a concise markdown summary.

Format:

## Overview

## Main Ideas

## Key Findings

Keep it easy to read.

Document:

{text}
"""

    return ask_ollama(prompt)