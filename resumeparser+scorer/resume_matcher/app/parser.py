from io import BytesIO
from PyPDF2 import PdfReader
from docx import Document

def extract_text_from_pdf(file_bytes):
    reader = PdfReader(BytesIO(file_bytes))
    return " ".join(page.extract_text() for page in reader.pages if page.extract_text())

def extract_text_from_docx(file_bytes):
    doc = Document(BytesIO(file_bytes))
    return " ".join(p.text for p in doc.paragraphs if p.text)

def parse_resume(file_name, file_bytes):
    if file_name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif file_name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    raise ValueError("Unsupported file format")

# app/parser.py

from pdfminer.high_level import extract_text
from io import BytesIO

def extract_resume_text(file_bytes):
    stream = BytesIO(file_bytes)
    return extract_text(stream)

def extract_jd_text(file_bytes):
    stream = BytesIO(file_bytes)
    return extract_text(stream)
