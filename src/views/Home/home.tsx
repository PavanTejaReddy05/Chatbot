import React, { useRef, useState } from 'react';
import "./home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const Home: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [response, setResponse] = useState<string>("");
  const [question, setQuestion] = useState<string>("");

  const handleIconClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/ask`, { question });
      setResponse(res.data.answer);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in handleSubmit:", error.message);
        setResponse("Failed to get a response from the server.");
      } else {
        console.error("Unexpected error:", error);
        setResponse("An unexpected error occurred.");
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${BASE_URL}/uploadfile/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResponse(res.data.full_text || "File uploaded successfully.");
    } catch (error) {
      console.error("Failed to upload file:", error);
      setResponse("Failed to upload file.");
    }
  };

  return (
    <div className="html">
      <div className="page">
        <h1>Welcome to ChatBot!!!</h1>
        <p>Please Provide the File: </p>
        
        <div className="input-container">
          {/* File upload icon inside the input container */}
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
          />
          <div className="ask">
          <FontAwesomeIcon 
            icon={faPaperclip} 
            className="icon" 
            onClick={handleIconClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleIconClick();
              }
            }}
          />
          <input 
            id='Ques' 
            type='text' 
            placeholder='Feel free to ask'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          </div>
        </div>
        
        <button id='Submit' onClick={handleSubmit}>Submit</button>
        
        <div className="response">
        <h2>Response:</h2>
        <p>{response}</p>
      </div>
      </div>
    </div>
  );
}

export default Home;
