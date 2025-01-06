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
        response => {this.responseText = response.answer;
          if (response.audio_url) {
            const audio = new Audio(response.audio_url);
            audio.play().catch(error => {
              this.responseText='Audio playback failed:', {error};
              console.error('Audio playback failed:', error);
            });
          } else {
            console.log('Audio URL not available in the response.');
            this.responseText = 'Audio URL not available in the response.';
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