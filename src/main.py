import os
import re
import pdfplumber
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cohere
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="D:/Programming/React files/chatbot/src/Cohere_API_Key.env")  # Load environment variables from .env file

cohere_api_key = os.getenv("COHERE_API_KEY")
if not cohere_api_key:
    raise ValueError("COHERE_API_KEY environment variable is not set.")
co = cohere.Client(api_key=cohere_api_key)
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store the extracted text from the last uploaded PDF
pdf_text_storage = ""

class Question(BaseModel):
    question: str

@app.post("/ask")
async def ask_cohere(question: Question):
    global pdf_text_storage
    if not pdf_text_storage:
        raise HTTPException(status_code=400, detail="No PDF content available. Please upload a PDF first.")
    
    try:
        prompt = f"Based on the following text from the PDF, answer the question:\n\n{pdf_text_storage[:2000]}\n\nQuestion: {question.question}"
        response = co.generate(
            model='command',
            prompt=prompt,
            max_tokens=100
        )
        answer = response.generations[0].text.strip()
        return JSONResponse(content={"question": question.question, "answer": answer})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...)):
    global pdf_text_storage
    try:
        with pdfplumber.open(file.file) as pdf:
            text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
        if not text:
            raise HTTPException(status_code=400, detail="No text found in PDF.")
        pdf_text_storage = text
        contact_numbers = re.findall(r'\+?\d[\d -]{8,}\d', text)
        return JSONResponse(content={"contact_numbers": contact_numbers, "full_text": ""})
    except pdfplumber.exceptions.PDFSyntaxError:
        raise HTTPException(status_code=400, detail="Invalid PDF file format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
