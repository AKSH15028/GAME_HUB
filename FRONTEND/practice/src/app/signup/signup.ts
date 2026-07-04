import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  username = '';
  email = '';
  password = '';

  constructor(private http: HttpClient, private router: Router){}

  onSignup() {
    const signupData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    // Send the data to your .NET backend
    this.http.post('http://localhost:5238/api/auth/register', signupData)
      .subscribe(response => {
        console.log('Registration successful', response);
        this.router.navigate(['/game']);
      }, error => {
        console.error('Registration failed', error);
      });
  }
}
