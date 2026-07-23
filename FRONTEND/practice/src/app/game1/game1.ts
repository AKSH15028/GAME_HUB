import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Game1Service as GameService } from '../services/game1services';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { GameSession, GuessPayload, GuessResult, Card } from '../game1model';

@Component({
  selector: 'app-game1',
  standalone: true,         
  imports: [CommonModule, RouterLink],
  templateUrl: './game1.html',
  styleUrls: ['./game1.css']
})
export class Game1 implements OnInit, OnDestroy {

  username: string = 'CyberPlayer';
  currentSessionId: string = '';
  score: number = 0;
  round: number = 1;
  highScore: number = 0;
  strikes: number = 0;
  streak: number = 0;

  // Active playing cards lists
  targetCard: Card | null = null;
  gridCards: Card[] = [];

  // State Machine control flags: 'REVEAL' | 'GRID' | 'GUESS' | 'RESOLUTION' | 'GAMEOVER'
  gameState: 'REVEAL' | 'GRID' | 'GUESS' | 'RESOLUTION' | 'GAMEOVER' = 'REVEAL';
  resultText: string = '—';
  resultClass: string = 'waiting';
  
  // Timer attributes
  timerValue: number = 0;
  private timerSubscription?: Subscription;

  private suits = ['♠', '♥', '♦', '♣'];
  private ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6'];

  constructor(private gameService: GameService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.username) this.username = u.username;
      } catch (e) {}
    }

    this.startNewGame();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startNewGame(): void {
    this.score = 0;
    this.round = 1;
    this.strikes = 0;
    this.streak = 0;
    this.currentSessionId = '';
    this.loadNextRound();
  }

  loadNextRound(): void {
    this.stopTimer();
    this.gameState = 'REVEAL';
    this.resultText = '—';
    this.resultClass = 'waiting';
    this.cdr.detectChanges();

    this.gameService.startRound(this.currentSessionId, this.score, this.streak, this.strikes)
      .subscribe({
        next: (session: GameSession) => {
          if (session && session.gridCards && session.gridCards.length > 0) {
            this.setupRoundData(session);
          } else {
            this.setupFallbackRound();
          }
        },
        error: (err: any) => {
          console.error('API error starting round, generating fallback local round...', err);
          this.setupFallbackRound();
        }
      });
  }

  private setupRoundData(session: GameSession): void {
    this.currentSessionId = session.gameSessionId || 'local-' + Date.now();
    this.targetCard = session.targetCard;
    
    // Ensure all grid cards start explicitly face-up (isFlipped = false)
    this.gridCards = session.gridCards.map((card: any) => ({
      ...card,
      isFlipped: false
    }));
    
    this.cdr.detectChanges();
    this.runTargetRevealPhase();
  }

  private setupFallbackRound(): void {
    const grid: Card[] = [];
    const themes = [
      { border: 'neon-border-red', text: 'red-text' },
      { border: 'neon-border-cyan', text: 'cyan-text' },
      { border: 'neon-border-green', text: 'green-text' },
      { border: 'neon-border-purple', text: 'purple-text' }
    ];

    for (let i = 0; i < 9; i++) {
      const suit = this.suits[i % this.suits.length];
      const rank = this.ranks[i % this.ranks.length];
      const isRed = suit === '♥' || suit === '♦';
      const theme = isRed ? themes[0] : themes[1 + (i % 3)];

      grid.push({
        cardId: i,
        suit,
        rank,
        themeColor: theme.border,
        textColor: theme.text,
        isFlipped: false
      });
    }

    grid.sort(() => 0.5 - Math.random());
    grid.forEach((c, idx) => c.cardId = idx);

    const targetIdx = Math.floor(Math.random() * 9);
    this.targetCard = grid[targetIdx];
    this.gridCards = grid;
    this.currentSessionId = 'local-' + Date.now();

    this.cdr.detectChanges();
    this.runTargetRevealPhase();
  }

  // Phase 1: Target Reveal (3 Seconds Focus Duration)
  runTargetRevealPhase(): void {
    this.gameState = 'REVEAL';
    this.startCountdown(3, () => {
      this.runGridLayoutPhase();
    });
  }

  // Phase 2: Grid Layout Scan Phase (5 Seconds Location Track)
  runGridLayoutPhase(): void {
    this.gameState = 'GRID';
    this.startCountdown(5, () => {
      this.runFlipAndGuessPhase();
    });
  }

  // Phase 3: Flip & Guess Phase (10 Seconds Countdown Limit)
  runFlipAndGuessPhase(): void {
    this.gameState = 'GUESS';

    // Flip all grid cards face-down
    this.gridCards.forEach(card => card.isFlipped = true);
    this.cdr.detectChanges();

    this.startCountdown(10, () => {
      // If timer bottoms out, evaluate time out as incorrect guess
      this.handleGuessEvaluation(-1);
    });
  }

  // User Guess Submission Point
  onCardClick(clickedCard: Card): void {
    if (this.gameState !== 'GUESS') return;
    
    this.stopTimer();
    this.handleGuessEvaluation(clickedCard.cardId);
  }

  handleGuessEvaluation(selectedCardId: number): void {
    this.gameState = 'RESOLUTION';

    const payload: GuessPayload = {
      gameSessionId: this.currentSessionId,
      selectedCardId: selectedCardId,
      secondsRemaining: this.timerValue,
      username: this.username
    };

    this.gameService.submitGuess(payload).subscribe({
      next: (result: GuessResult) => {
        this.score = result.currentScore;
        this.streak = result.currentStreak;
        this.strikes = result.strikes;

        // Force all cards to flip back face-up so player sees where everything sat
        this.gridCards.forEach(card => card.isFlipped = false);

        if (result.isCorrect) {
          this.resultText = 'CORRECT!';
          this.resultClass = 'correct';
          
          const matchingCard = this.gridCards.find(c => c.cardId === selectedCardId);
          if (matchingCard) matchingCard.themeColor = 'neon-border-green';
        } else {
          this.resultText = 'WRONG!';
          this.resultClass = 'wrong';

          const incorrectCard = this.gridCards.find(c => c.cardId === selectedCardId);
          if (incorrectCard) incorrectCard.themeColor = 'neon-border-red';
        }

        this.cdr.detectChanges();

        setTimeout(() => {
          if (result.isGameOver || this.strikes >= 2) {
            this.gameState = 'GAMEOVER';
          } else {
            this.round += 1;
            this.loadNextRound();
          }
          this.cdr.detectChanges();
        }, 2200);
      },
      error: (err: any) => {
        console.error('Error evaluating guess:', err);
        // Fallback local evaluation
        this.gridCards.forEach(card => card.isFlipped = false);
        const isMatch = this.targetCard ? selectedCardId === this.targetCard.cardId : false;
        
        if (isMatch) {
          this.score += 100;
          this.resultText = 'CORRECT!';
          this.resultClass = 'correct';
        } else {
          this.strikes += 1;
          this.resultText = 'WRONG!';
          this.resultClass = 'wrong';
        }

        this.cdr.detectChanges();

        setTimeout(() => {
          if (this.strikes >= 2) {
            this.gameState = 'GAMEOVER';
          } else {
            this.round += 1;
            this.loadNextRound();
          }
          this.cdr.detectChanges();
        }, 2200);
      }
    });
  }

  private startCountdown(durationSeconds: number, onComplete: () => void): void {
    this.stopTimer();
    this.timerValue = durationSeconds;
    this.cdr.detectChanges();

    this.timerSubscription = interval(1000)
      .pipe(take(durationSeconds))
      .subscribe({
        next: () => {
          if (this.timerValue > 0) {
            this.timerValue -= 1;
          }
          this.cdr.detectChanges();
        },
        complete: () => {
          this.cdr.detectChanges();
          onComplete();
        }
      });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}