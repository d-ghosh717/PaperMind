def load_prompt(path, text):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:

        prompt = f.read()

    return prompt.replace(
        "{TEXT}",
        text
    )