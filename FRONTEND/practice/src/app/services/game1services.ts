import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSession, GuessPayload, GuessResult } from '../game1model';

@Injectable({
  providedIn: 'root'
})
export class Game1Service {
  // Update this port to match your .NET backend running URL (usually localhost:5000 or 7000+)
  private apiUrl = 'https://localhost:5238/api/game'; 

  constructor(private http: HttpClient) {}

  /**
   * Hits the backend to start a brand new round. 
   * It passes current game parameters so the server can track them inside cache.
   */
  startRound(
    sessionId: string = '', 
    currentScore: number = 0, 
    currentStreak: number = 0, 
    currentStrikes: number = 0
  ): Observable<GameSession> {
    const url = `${this.apiUrl}/start?sessionId=${sessionId}&currentScore=${currentScore}&currentStreak=${currentStreak}&currentStrikes=${currentStrikes}`;
    return this.http.post<GameSession>(url, {});
  }

  /**
   * Submits the player's chosen card index and performance metrics for server validation.
   */
  submitGuess(payload: GuessPayload): Observable<GuessResult> {
    return this.http.post<GuessResult>(`${this.apiUrl}/guess`, payload);
  }
}