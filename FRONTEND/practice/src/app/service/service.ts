import { Component } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../app.config'; // Import the token
@Component({
  selector: 'app-service',
  imports: [],
  templateUrl: './service.html',
  styleUrl: './service.css',
})
export class Service {}


@Injectable({ providedIn: 'root' })
export class DataService {
  // Use the inject() function to get the value
  private apiUrl = inject(API_URL);
  private http = inject(HttpClient);

  getData() {
    // Now you can use this.apiUrl anywhere in this service
    return this.http.get(this.apiUrl + 'your-endpoint');
  }
}