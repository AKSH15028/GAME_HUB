import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
import { ProfileService } from '../services/profile';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
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
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = loggedInUser.id; 

    if (currentUserId) {
      this.profileService.getProfile(currentUserId).subscribe(data => {
        console.log("User Data Received from Backend:", data);
        this.user = data;
        
        // 3. Force Angular to update the HTML immediately
        this.cdr.detectChanges(); 
      });
    }
  }
}