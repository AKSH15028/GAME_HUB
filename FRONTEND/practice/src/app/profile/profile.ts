import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
import { ProfileService } from '../services/profile';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  user: any;

  // 2. Inject it here in your constructor
  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    const loggedInUser = typeof localStorage !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    this.user = loggedInUser;
    const currentUserId = loggedInUser.id; 

    if (currentUserId) {
      this.profileService.getProfile(currentUserId).subscribe({
        next: (data) => {
          console.log("User Data Received from Backend:", data);
          if (data) this.user = { ...this.user, ...data };
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.warn("Backend profile load failed, using local user state.", err);
        }
      });
    }
  }
}