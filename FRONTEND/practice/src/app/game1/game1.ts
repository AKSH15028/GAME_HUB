import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game1Service as GameService } from '../services/game1services';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { GameSession, GuessPayload, GuessResult, Card } from '../game1model';

@Component({
  selector: 'app-game1',
  standalone: true,         
  imports: [CommonModule],
  templateUrl: './game1.html',
  styleUrls: ['./game1.css']
})
export class Game1 implements OnInit, OnDestroy {

  username: string = 'CyberPlayer'; // Replace this with a dynamic user lookup later
  currentSessionId: string = '';
  score: number = 0;
  round: number = 1;
  highScore: number = 0;
  strikes: number = 0;
  streak: number = 0;

  // Active playing cards lists
  targetCard: Card | null = null;
  gridCards: Card[] = [];

  // State Machine control flags
  gameState: 'REVEAL' | 'GRID' | 'GUESS' | 'RESOLUTION' | 'GAMEOVER' = 'REVEAL';
  resultText: string = '—';
  resultClass: string = 'waiting';
  
  // Timer attributes
  timerValue: number = 0;
  private timerSubscription?: Subscription;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
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

    // Call our .NET API to provision a fresh obfuscated round arrangement
    this.gameService.startRound(this.currentSessionId, this.score, this.streak, this.strikes)
      .subscribe({
        next: (session: GameSession) => {
          this.currentSessionId = session.gameSessionId;
          this.targetCard = session.targetCard;
          
          // Force all backend cards to be explicitly face-up initially on the frontend
          this.gridCards = session.gridCards.map((card: any) => ({ ...card, isFlipped: false }));
          
          this.runTargetRevealPhase();
        },
        error: (err: any) => console.error('Failed to provision...', err)
      });
  }

  // Phase 1: Target Reveal (3 Seconds Focus Duration)
  runTargetRevealPhase(): void {
    this.gameState = 'REVEAL';
    this.timerValue = 3;
    
    this.startCountdown(3, () => {
      this.runGridLayoutPhase();
    });
  }

  // Phase 2: Grid Layout Phase (10 Seconds Location Scan Track)
  runGridLayoutPhase(): void {
    this.gameState = 'GRID';
    this.timerValue = 10;
    
    this.startCountdown(10, () => {
      this.runFlipAndGuessPhase();
    });
  }

  // Phase 3: Flip & Guess Phase (10 Seconds Countdown Limit)
  runFlipAndGuessPhase(): void {
    this.gameState = 'GUESS';
    this.timerValue = 10;

    // Concurrently trigger the 3D visual rotation class on all grid cards
    this.gridCards.forEach(card => card.isFlipped = true);

    this.startCountdown(10, () => {
      // If timer bottoms out before user makes a decision, force handle an empty wrong selection
      this.handleGuessEvaluation(-1);
    });
  }

  // User Guess Submission Point
  onCardClick(clickedCard: Card): void {
    // Blocks interaction if the user isn't strictly in the guessing timeline phase
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

        // Force all cards to flip back open so the user sees where everything sat
        this.gridCards.forEach(card => card.isFlipped = false);

        if (result.isCorrect) {
          this.resultText = 'Correct';
          this.resultClass = 'correct';
          
          // Apply an explicit positive visual feedback ring color back onto their selected item choice
          const matchingCard = this.gridCards.find(c => c.cardId === selectedCardId);
          if (matchingCard) matchingCard.themeColor = 'neon-border-green';
        } else {
          this.resultText = 'Wrong';
          this.resultClass = 'wrong';

          // Apply error highlighted border markers to show context correction paths
          const incorrectCard = this.gridCards.find(c => c.cardId === selectedCardId);
          if (incorrectCard) incorrectCard.themeColor = 'neon-border-red';
        }

        // Evaluate next routing condition choices
        setTimeout(() => {
          if (result.isGameOver) {
            this.gameState = 'GAMEOVER';
          } else {
            this.round += 1;
            this.loadNextRound();
          }
        }, 2500); // 2.5 second dramatic delay pause window
      },
      error: (err: any) => console.error('Error evaluating response authorization sequence:', err)
    });
  }

  // Timer Core Assistant Logic
  private startCountdown(durationSeconds: number, onComplete: () => void): void {
    this.stopTimer();
    this.timerSubscription = interval(1000)
      .pipe(take(durationSeconds))
      .subscribe({
        next: () => {
          this.timerValue -= 1;
        },
        complete: () => {
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