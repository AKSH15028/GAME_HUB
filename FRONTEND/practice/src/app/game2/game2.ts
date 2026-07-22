import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Game2QuizService, QuizQuestion, QuizAnswerResult } from '../services/game2quizservices';

@Component({
  selector: 'app-game2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game2.html',
  styleUrl: './game2.css'
})
export class Game2 implements OnInit, OnDestroy {
  username: string = 'CyberPlayer';
  
  // Game states: 'CATEGORY' | 'QUESTION' | 'FEEDBACK' | 'RESULTS'
  gameState: 'CATEGORY' | 'QUESTION' | 'FEEDBACK' | 'RESULTS' = 'CATEGORY';

  categories: string[] = ['All', 'Tech & Gaming', 'Science & Nature', 'General Knowledge', 'Pop Culture & History'];
  selectedCategory: string = 'All';

  questions: QuizQuestion[] = [];
  currentIndex: number = 0;
  currentQuestion: QuizQuestion | null = null;

  score: number = 0;
  streak: number = 0;
  maxStreak: number = 0;
  correctAnswersCount: number = 0;

  timerValue: number = 15;
  private timerSubscription?: Subscription;

  selectedOptionIndex: number | null = null;
  lastResult: QuizAnswerResult | null = null;

  // Lifelines state
  lifelines = {
    fiftyFiftyUsed: false,
    skipUsed: false,
    timeBoostUsed: false
  };
  hiddenOptionIndices: number[] = [];

  constructor(private quizService: Game2QuizService) {}

  ngOnInit(): void {
    const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.username) this.username = u.username;
      } catch (e) {}
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  selectCategoryAndStart(cat: string): void {
    this.selectedCategory = cat;
    this.startNewQuiz();
  }

  startNewQuiz(): void {
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctAnswersCount = 0;
    this.currentIndex = 0;
    this.lifelines = { fiftyFiftyUsed: false, skipUsed: false, timeBoostUsed: false };

    this.quizService.getQuestions(this.selectedCategory, 8).subscribe({
      next: (qList) => {
        this.questions = qList;
        if (this.questions.length > 0) {
          this.loadQuestion(0);
        } else {
          this.gameState = 'CATEGORY';
        }
      },
      error: (err) => console.error('Failed to load quiz questions', err)
    });
  }

  loadQuestion(index: number): void {
    this.stopTimer();
    this.currentIndex = index;
    this.currentQuestion = this.questions[index];
    this.selectedOptionIndex = null;
    this.lastResult = null;
    this.hiddenOptionIndices = [];
    this.gameState = 'QUESTION';
    this.timerValue = 15;

    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerSubscription = interval(1000)
      .pipe(take(this.timerValue))
      .subscribe({
        next: () => {
          this.timerValue -= 1;
        },
        complete: () => {
          if (this.gameState === 'QUESTION') {
            // Time out evaluated as wrong answer (-1 selection)
            this.submitOption(-1);
          }
        }
      });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  submitOption(optionIndex: number): void {
    if (this.gameState !== 'QUESTION' || !this.currentQuestion) return;
    this.stopTimer();

    this.selectedOptionIndex = optionIndex;
    this.gameState = 'FEEDBACK';

    const payload = {
      questionId: this.currentQuestion.id,
      selectedOptionIndex: optionIndex,
      secondsRemaining: this.timerValue,
      currentStreak: this.streak,
      username: this.username
    };

    this.quizService.submitAnswer(payload).subscribe({
      next: (result) => {
        this.lastResult = result;
        if (result.isCorrect) {
          this.score += result.pointsEarned;
          this.streak += 1;
          this.correctAnswersCount += 1;
          if (this.streak > this.maxStreak) this.maxStreak = this.streak;
        } else {
          this.streak = 0;
        }

        setTimeout(() => {
          this.nextQuestion();
        }, 2200);
      },
      error: (err) => {
        console.error('Error submitting answer', err);
        setTimeout(() => this.nextQuestion(), 2000);
      }
    });
  }

  nextQuestion(): void {
    if (this.currentIndex + 1 < this.questions.length) {
      this.loadQuestion(this.currentIndex + 1);
    } else {
      this.gameState = 'RESULTS';
    }
  }

  // Lifeline Actions
  useFiftyFifty(): void {
    if (this.lifelines.fiftyFiftyUsed || this.gameState !== 'QUESTION' || !this.currentQuestion) return;
    this.lifelines.fiftyFiftyUsed = true;

    // Find 2 incorrect indices to hide
    const correctIdx = this.currentQuestion.correctOptionIndex ?? 0;
    const incorrectIndices = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
    // Shuffle and pick 2
    incorrectIndices.sort(() => 0.5 - Math.random());
    this.hiddenOptionIndices = incorrectIndices.slice(0, 2);
  }

  useSkip(): void {
    if (this.lifelines.skipUsed || this.gameState !== 'QUESTION') return;
    this.lifelines.skipUsed = true;
    this.stopTimer();
    this.nextQuestion();
  }

  useTimeBoost(): void {
    if (this.lifelines.timeBoostUsed || this.gameState !== 'QUESTION') return;
    this.lifelines.timeBoostUsed = true;
    this.timerValue += 10;
    this.startTimer();
  }

  getAccuracy(): number {
    if (this.questions.length === 0) return 0;
    return Math.round((this.correctAnswersCount / this.questions.length) * 100);
  }
}
