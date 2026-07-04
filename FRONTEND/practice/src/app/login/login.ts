import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, Header,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // 1. Declare the properties here
  email = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    // Now these will not have squiggly lines
    console.log('Logging in with:', this.email, this.password);
    
    // Store the token (for now)
    localStorage.setItem('userToken', 'authenticated');
    
    // Redirect
    this.router.navigate(['/game']);
  }
}
