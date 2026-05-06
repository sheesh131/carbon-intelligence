import PyPDF2

pdf_path = r"c:\Users\dudei\OneDrive\Desktop\Major project\carbon-intelligence\frontend\src\Major Project 50.pdf"
output_path = r"c:\Users\dudei\OneDrive\Desktop\Major project\carbon-intelligence\frontend\extracted_pdf.txt"

text = ""
with open(pdf_path, 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    for page in reader.pages:
        text += page.extract_text() + "\n"

with open(output_path, 'w', encoding='utf-8') as out:
    out.write(text)
