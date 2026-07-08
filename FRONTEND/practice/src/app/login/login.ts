import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Ensure this is imported if standalone
import { Header } from '../header/header';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Header], // Keeps ngModel working
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // 1. Declare the variables that your HTML ngModel is binding to
  email = '';
  password = '';

  // 2. Inject HttpClient and Router inside the constructor
  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    // 3. Create the payload object using your email and password variables
    const loginDto = {
      email: this.email,
      password: this.password
    };

    // 4. Send the post request to your backend
    this.http.post('http://localhost:5238/api/auth/login', loginDto).subscribe({
      next: (response: any) => {
        if (response && response.token) {
          // Save the full user object down to localStorage
          localStorage.setItem('user', JSON.stringify({
            id: response.id,
            username: response.username,
            email: response.email,
            token: response.token
          }));

          // Redirect to the profile page
          this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Invalid email or password');
      }
    });
  }
}