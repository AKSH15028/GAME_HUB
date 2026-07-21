import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GameSession {
  id: string;
  grid: number[];
  currentScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:5000/api/game'; // Adjust port to match your local .NET configuration

  constructor(private http: HttpClient) {}

  getSession(): Observable<GameSession> {
    return this.http.get<GameSession>(this.apiUrl);
  }

  saveMove(session: GameSession): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.apiUrl}/move`, session);
  }

  undoMove(): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.apiUrl}/undo`, {});
  }

  resetGame(): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.apiUrl}/reset`, {});
  }
}