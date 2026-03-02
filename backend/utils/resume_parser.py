import fitz  # This is provided by pymupdf

def extract_text_from_file(file_path):
    try:
        text = ""
        # Open the PDF document
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""