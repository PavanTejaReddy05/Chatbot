import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  [x: string]: any;
  signupForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.signupForm = this.fb.group({
      First_Name: ['', [Validators.required]],
      Last_Name: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      Ph_No: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      DoB: ['', [Validators.required]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      Confirm_Password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;
      this.http.post<any>('http://127.0.0.1:8000/Signup', formData).subscribe(
        response => {
          if (response.status==="success"){
            alert("Registration Successfull...")
            this.router.navigate(['/signin']);
          }else{
          this.successMessage = response.Message;
          this.errorMessage = '';
          this.signupForm.reset();
          }
        },
        error => {
          this.errorMessage = error.error.detail || 'An error occurred.';
          this.successMessage = '';
        }
      );
    }
  }
}
