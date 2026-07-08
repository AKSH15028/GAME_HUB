import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // Update this URL to match your backend API address
  private apiUrl = 'http://localhost:5238/api/profile';

  constructor(private http: HttpClient) {}

  // Example method to get profile data
  getProfile(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
