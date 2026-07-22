import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GameSession, GuessPayload, GuessResult, Card } from '../game1model';

@Injectable({
  providedIn: 'root'
})
export class Game1Service {
  private apiUrl = 'http://localhost:5238/api/game1';

  private suits = ['♠', '♥', '♦', '♣'];
  private ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6'];
  private activeTargetCard: Card | null = null;

  constructor(private http: HttpClient) {}

  startRound(
    sessionId: string = '', 
    currentScore: number = 0, 
    currentStreak: number = 0, 
    currentStrikes: number = 0
  ): Observable<GameSession> {
    const url = `${this.apiUrl}/start?sessionId=${sessionId}&currentScore=${currentScore}&currentStreak=${currentStreak}&currentStrikes=${currentStrikes}`;
    return this.http.post<GameSession>(url, {}).pipe(
      catchError(() => {
        // Fallback local round generator
        const grid: Card[] = [];
        for (let i = 0; i < 9; i++) {
          const suit = this.suits[Math.floor(Math.random() * this.suits.length)];
          const rank = this.ranks[Math.floor(Math.random() * this.ranks.length)];
          const isRed = suit === '♥' || suit === '♦';
          grid.push({
            cardId: i,
            suit,
            rank,
            themeColor: isRed ? 'neon-border-red' : 'neon-border-cyan',
            textColor: isRed ? 'text-red' : 'text-cyan',
            isFlipped: false
          });
        }
        const targetIdx = Math.floor(Math.random() * 9);
        this.activeTargetCard = grid[targetIdx];

        const fallbackSession: GameSession = {
          gameSessionId: sessionId || 'local-' + Date.now(),
          targetCard: grid[targetIdx],
          gridCards: grid
        };
        return of(fallbackSession);
      })
    );
  }

  submitGuess(payload: GuessPayload): Observable<GuessResult> {
    return this.http.post<GuessResult>(`${this.apiUrl}/guess`, payload).pipe(
      catchError(() => {
        const isCorrect = this.activeTargetCard ? payload.selectedCardId === this.activeTargetCard.cardId : true;
        const correctCardId = this.activeTargetCard ? this.activeTargetCard.cardId : payload.selectedCardId;
        const points = isCorrect ? 50 + payload.secondsRemaining * 10 : 0;

        return of({
          isCorrect,
          correctCardId,
          pointsEarned: points,
          currentScore: isCorrect ? points : 0,
          currentStreak: isCorrect ? 1 : 0,
          strikes: isCorrect ? 0 : 1,
          isGameOver: false
        });
      })
    );
  }
}