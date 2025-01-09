import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SigninComponent {
  signinForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router){
    this.signinForm=this.fb.group({
      ema:['',[Validators.required]],
      pwd:['',[Validators.required, Validators.minLength(6)]]
    });
  }
  onSubmit(){
    const  ema=this.signinForm.value.ema; // Ensure the key is "Uname"
    const  pwd=this.signinForm.value.pwd;    // Ensure the key is "Pwd"
    
    this.http.get<any>(`http://127.0.0.1:8000/Signin?ema=${ema}&Pwd=${pwd}`).subscribe(
      response => {
        if (response.status === "success") {
          const token = response.Jwt_Token;
          localStorage.setItem('jwtToken', token); // Store token
          console.log('Login successful:', response);
          this.router.navigate(['/index']);
        }
      },
      error => {
        console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  );
  }
}