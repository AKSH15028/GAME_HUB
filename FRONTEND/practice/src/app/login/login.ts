import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Header } from '../header/header';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, Header],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  
  constructor(private router: Router) {}

  onLogin() {
        // 3. THIS IS THE SECURITY ADDITION:
    // Store the "key" in the browser so the Guard can find it
    localStorage.setItem('userToken', 'authenticated');

    // 4. Then redirect
    this.router.navigate(['/game']);
  }
}
