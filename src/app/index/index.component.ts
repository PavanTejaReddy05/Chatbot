import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {
  responseText: string = `Welcome to the PDF Extractor AI-Based QA`;
  userInput: string = '';
  selectedFile: File | null = null;
  faPaperclip: IconProp = faPaperclip;

  constructor(private http: HttpClient, private router:Router) { }

  // Handle input submission
  onSubmit() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        this.responseText = 'Please log in to ask questions.';
        alert("Session expired, Please Login again...");
        this.router.navigate(['/signin']);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    this.http.post<any>('http://127.0.0.1:8000/ask', { question: this.userInput }, { headers })
        .subscribe(
            response => {
                // Display the text response
                this.responseText = response.answer;

                // Handle Base64-encoded audio
                if (response.audio_base64) {
                    try {
                        // Decode Base64 and convert to binary data
                        const binaryAudio = atob(response.audio_base64);
                        const binaryData = Uint8Array.from(binaryAudio, char => char.charCodeAt(0));

                        // Create a Blob for the audio
                        const audioBlob = new Blob([binaryData], { type: "audio/mpeg" });

                        // Generate a URL for the Blob
                        const audioUrl = URL.createObjectURL(audioBlob);

                        // Play the audio
                        const audio = new Audio(audioUrl);
                        audio.play().catch(error => {
                            console.error('Audio playback failed:', error);
                            this.responseText = 'Audio playback failed.';
                        });
                    } catch (error) {
                        console.error('Failed to decode or play the audio:', error);
                        this.responseText = 'Failed to decode or play the audio.';
                    }
                } else {
                    console.log('Audio data not available in the response.');
                    this.responseText = 'Audio data not available in the response.';
                }
            },
            error => {
                console.error('Error:', error);
                if (error.status === 401) {
                    this.responseText = 'Your session has expired. Please log in again.';
                    localStorage.removeItem('jwtToken');
                    alert("Session expired, Please Login again...");
                    this.router.navigate(['/signin']);
                } else {
                    this.responseText = 'An error occurred while fetching the response.';
                }
            }
        );
  }

  
  
  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      
      // Check if the selected file is either PDF or DOC
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(this.selectedFile.type)) {
        this.responseText = 'Please upload a PDF, DOC, or DOCX file.';
        alert('Only PDF, DOC, and DOCX files are allowed.');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', this.selectedFile);
  
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        this.responseText = 'Please log in to upload files.';
        this.router.navigate(['/signin']);
        return;
      }
  
      const headers = { Authorization: `Bearer ${token}` };
      this.http.post<any>('http://127.0.0.1:8000/uploadfile/', formData, { headers })
        .subscribe(
          response => {
            console.log('File upload successful:', response);
            this.responseText = 'File uploaded successfully. You can now ask questions.';
          },
          error => {
            console.error('Error uploading file:', error);
            this.responseText = 'Failed to upload the file.';
          }
        );
    }
  }  
}  