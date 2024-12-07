import React, { useRef, useState } from 'react';
import "./home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Define API response interfaces
interface AskResponse {
  answer: string;
}

interface UploadFileResponse {
  full_text?: string;
}

// Base URL for API requests
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://127.0.0.1:8000';

const Home: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [response, setResponse] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleIconClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      setResponse("Please enter a question.");
      return;
    }

    setIsLoading(true); // Show loading indicator
    try {
      const res = await axios.post<AskResponse>(`${BASE_URL}/ask`, { question });
      setResponse(res.data.answer); // Type-safe access to response
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setResponse("Failed to get a response from the server.");
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB size limit
      setResponse("File size exceeds the 5MB limit.");
      return;
    }

    if (!['text/plain', 'application/pdf'].includes(file.type)) {
      setResponse("Unsupported file type. Only TXT and PDF files are allowed.");
      return;
    }

    setIsLoading(true); // Show loading indicator
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post<UploadFileResponse>(`${BASE_URL}/uploadfile/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponse(res.data.full_text || "File uploaded successfully.");
    } catch (error) {
      console.error("Failed to upload file:", error);
      setResponse("Failed to upload file.");
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="html">
      <div className="page">
        <h1>Welcome to ChatBot!!!</h1>
        <p>Please Provide the File:</p>
        
        <div className="input-container">
          {/* File upload input (hidden) */}
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
              id="Ques" 
              type="text" 
              placeholder="Feel free to ask"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
        </div>
        
        <button id="Submit" onClick={handleSubmit} disabled={isLoading || !question.trim()}>
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
        
        <div className="response">
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
