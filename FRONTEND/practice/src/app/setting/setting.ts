import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({ 
  selector: 'app-setting',
  standalone: true, // Assuming you are using standalone components based on your folder structure
  imports: [HttpClientModule, RouterLink], // Ensure HttpClientModule is imported if needed
  templateUrl: './setting.html',
  styleUrls: ['./setting.css']
 })
export class Setting {
  // Inject HttpClient and Router
  constructor(private http: HttpClient, private router: Router) {}

  onLogout() {
    // Call your backend logout endpoint
    this.http.post('http://localhost:5238/api/auth/logout', {}).subscribe({
      next: () => {
        // Clear local data and redirect
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
        // Optional: still redirect or show error
      }
    });
  }
}
