import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Header } from '../header/header';



@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink, Header],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem('userToken') !== null;
  }
}