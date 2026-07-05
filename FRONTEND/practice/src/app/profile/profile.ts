import { Component, OnInit } from '@angular/core';
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

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getProfile(1).subscribe(data => {
      this.user = data;
    });
  }
}
