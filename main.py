import os
import re
from pymongo import MongoClient
from pathlib import Path
from uuid import uuid4
import pdfplumber
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import BackgroundTasks
from pydantic import BaseModel
import cohere
import base64
from gtts import gTTS
from typing import Dict
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt


# client = MongoClient("mongodb+srv://bogireddyptr5:Bogireddyptr5@cluster0.uq0feuh.mongodb.net/")  # Update the URI as needed
# db = client["PDFChatbot"]

# Load environment variables
load_dotenv()

client_str=os.getenv("Client")
client=MongoClient(client_str)

db_name = os.getenv("DB_NAME")
db=client[db_name]

col_name=os.getenv("COLLECTION_NAME")
col = db[col_name]

SECRET_KEY = os.getenv("Secret_Key")
# print(f"Loaded Secret_KEY: {SECRET_KEY}")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

cohere_api_key = os.getenv("COHERE_API_KEY")
# print(f"Loaded COHERE_API_KEY: {cohere_api_key}")

if not cohere_api_key:
    raise ValueError("COHERE_API_KEY environment variable is not set.")
co = cohere.Client(api_key=cohere_api_key)

app = FastAPI()
# CORS middleware
origins=[
    "*",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.storage = {"pdf_text": ""}  # Shared storage

def get_storage():
    return app.state.storage

class Question(BaseModel):
    question: str

class Reg(BaseModel):
    First_Name:str
    Last_Name:str
    Email:str
    Ph_No:int
    DoB:str
    Password:str
    Confirm_Password:str

async def Vrfy_Tkn(token:str):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        print(f"Token payload: {payload}")
        return payload
    except JWTError as e:
        print(f"Token verification error: {e}")
        return None


@app.post("/Signup")
async def Registration(R: Reg):
    # Check if passwords match
    if R.Password != R.Confirm_Password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check if the email already exists
    if col.find_one({"Email": R.Email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    # Prepare data for insertion
    data = R.dict()
    data.pop("Confirm_Password")
    data["Password"] = bcrypt.hash(data["Password"])  # Hash the password

    # Insert the user into the database
    try:
        result = col.insert_one(data)
        if result.inserted_id:
            return {"status": "success", "message": "Registration successful"}
        else:
            raise HTTPException(status_code=500, detail="Failed to register user")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/Signin")
def LogIn(ema:str, Pwd:str):
    cred=col.find_one({"Email":ema})
    if not cred:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if bcrypt.verify(Pwd, cred["Password"]):
        pt=datetime.utcnow()
        exp=pt+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload={
            "UserName":ema,
            "present_time":pt.isoformat(),
            "Expiry":exp.isoformat()
            }
        token=jwt.encode(payload,SECRET_KEY,ALGORITHM)
        if token:
            return {"status": "success", "message": "Login successful", "Jwt_Token":token}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# def delete_audio_file(file_path: str):
#     if os.path.exists(file_path):
#         os.remove(file_path)
#         print(f"Deleted file: {file_path}")
async def delete_audio_file(file_path: Path):
    """
    Deletes the specified audio file.
    """
    try:
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        print(f"Failed to delete file {file_path}: {e}")

@app.post("/ask")
async def ask_cohere(
    question: Question,
    background_tasks: BackgroundTasks,
    storage: dict = Depends(get_storage),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    token = credentials.credentials
    print(f"Received token: {token}")
    
    payload = await Vrfy_Tkn(token)
    if not payload or datetime.utcnow() >= datetime.fromisoformat(payload.get("Expiry", "")):
        return JSONResponse(
            content={"message": "Token is expired or invalid. Please log in again."},
            status_code=401
        )
        
    text = storage.get('pdf_text')
    if not text:
        raise HTTPException(status_code=400, detail="No PDF content available. Please upload a PDF first.")

    try:
        # Prepare the prompt
        prompt = f"""
        Based on the following text from the PDF, answer the question:\n\n
        {text[:2000]}\n\nQuestion: {question.question}
        Answer:
        """
        
        # Log the prompt for debugging
        print(f"Generated prompt: {prompt}")

        # Generate response
        response = co.generate(
            model='command',
            prompt=prompt[:5000],
            max_tokens=300
        )
        
        if not response.generations:
            raise HTTPException(status_code=500, detail="No response from Cohere.")
        
        answer = response.generations[0].text.strip()
        AUDIO_FILE_NAME = "Response.mp3"
        file_path = Path(AUDIO_FILE_NAME)
        if file_path.exists():
            file_path.unlink()  # Delete the file

        tts = gTTS(text=answer, lang='en')
        tts.save(AUDIO_FILE_NAME)
        # Encode audio as base64
        with open(AUDIO_FILE_NAME, "rb") as audio_file:
            encoded_audio = base64.b64encode(audio_file.read()).decode('utf-8')

        # Return JSON response with text and Base64-encoded audio
        return JSONResponse(content={
            "question": question.question,
            "answer": answer,
            "audio_base64": encoded_audio
            })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occurred: {str(e)}")


# @app.get("/audio/{file_name}")
# async def get_audio(file_name: str, background_tasks: BackgroundTasks):
#     # Serves the audio file and schedules its deletion after serving.
#     file_path = Path(file_name)

#     if not file_path.exists():
#         raise HTTPException(status_code=404, detail="Audio file not found.")

#     # Schedule the audio file for deletion after serving
#     background_tasks.add_task(delete_audio_file, file_path)

#     # Serve the file
#     return FileResponse(file_path, media_type="audio/mpeg")

@app.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...), storage: dict = Depends(get_storage)):
    try:
        with pdfplumber.open(file.file) as pdf:
            text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
        if not text:
            raise HTTPException(status_code=400, detail="No readable text found in the PDF.")
        storage['pdf_text'] = text
        contact_numbers = re.findall(r'\+?\d[\d -]{8,}\d', text)
        return JSONResponse(content={"contact_numbers": contact_numbers, "full_text": text[:500]})
    except pdfplumber.exceptions.PDFSyntaxError:
        raise HTTPException(status_code=400, detail="Invalid PDF file format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
