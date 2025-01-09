import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Custom validator for matching passwords
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('Password')?.value;
  const confirmPassword = control.get('Confirm_Password')?.value;

  // If the passwords don't match, return an error
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

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
  message: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.signupForm = this.fb.group({
      First_Name: ['', [Validators.required]],
      Last_Name: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      Ph_No: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      DoB: ['', [Validators.required]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      Confirm_Password: ['', [Validators.required]]
      
    },{ validator: passwordMatchValidator });
  }
  allowOnlyLettersFN(event: KeyboardEvent): void {
    const regex = /^[A-Za-z]*$/;
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    
    // Check if the input already has 15 characters
    if (inputElement.value.length > 15) {
      event.preventDefault(); // Prevent typing if max length is reached
      return;
    }
    this.message = '';
    if (!regex.test(key)) {
      event.preventDefault(); // Prevents the invalid character from being entered
      this.message = 'Only letters are allowed.';
    }
  }


  allowOnlyLettersLN(event: KeyboardEvent): void {
    const regex = /^[A-Za-z]*$/;
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    
    // Check if the input already has 15 characters
    if (inputElement.value.length >= 10) {
      event.preventDefault(); // Prevent typing if max length is reached
      return;
    }
    this.message = '';
    if (!regex.test(key)) {
      event.preventDefault(); // Prevents the invalid character from being entered
      this.message = 'Only letters are allowed.';
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const input = event.key;
    const phoneNumber = (event.target as HTMLInputElement).value;
  
    // Allow only digits
    if (!/^[0-9]$/.test(input)) {
      event.preventDefault();
    }
  
    // Allow only up to 10 digits
    if (phoneNumber.length === 10 && !['Backspace', 'Delete'].includes(input)) {
      event.preventDefault();
    }
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
