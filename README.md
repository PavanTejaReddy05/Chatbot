AI Chatbot with PDF Q&A
This is an AI-powered chatbot built using React, Angular, FastAPI, and Cohere API. The chatbot allows users to upload a PDF, extract text, and ask questions based on the extracted content.

Features
✅ Upload PDFs and extract text
✅ AI-powered Q&A based on extracted content
✅ Seamless front-end with React and Angular
✅ Backend API built with FastAPI
✅ Uses Cohere API for natural language processing

Tech Stack
🔹 Frontend: Angular
🔹 Backend: FastAPI
🔹 AI Integration: Cohere API
🔹 Storage & Processing: Python-based text extraction

Setup Instructions
Clone the repository:
bash
Copy
Edit
git clone https://github.com/yourusername/chatbot-pdf-qa.git
cd chatbot-pdf-qa
Install dependencies:
bash
Copy
Edit
# Frontend
cd frontend
npm install  

# Backend
cd ../backend
pip install -r requirements.txt
Run the application:
bash
Copy
Edit
# Start Backend
uvicorn main:app --reload  

# Start Frontend
npm start  
Open http://localhost:3000/ to use the chatbot.
Future Enhancements
🚀 Support for multiple file formats
🚀 Enhanced AI responses using OpenAI/GPT
🚀 User authentication for personalized experience
