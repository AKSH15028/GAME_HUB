import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface QuizQuestion {
  id: number;
  category: string;
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
  explanation?: string;
  difficulty: string;
}

export interface QuizAnswerSubmission {
  questionId: number;
  selectedOptionIndex: number;
  secondsRemaining: number;
  currentStreak: number;
  username: string;
}

export interface QuizAnswerResult {
  isCorrect: boolean;
  correctOptionIndex: number;
  pointsEarned: number;
  explanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class Game2QuizService {
  private apiUrl = 'http://localhost:5238/api/game2';

  // Fallback default questions if backend is offline or loading
  private fallbackQuestions: QuizQuestion[] = [
    {
      id: 101,
      category: 'Tech & Gaming',
      questionText: 'What year was the original Super Mario Bros. released on NES?',
      options: ['1983', '1985', '1987', '1990'],
      correctOptionIndex: 1,
      explanation: 'Super Mario Bros. was released on September 13, 1985 in Japan.',
      difficulty: 'Easy'
    },
    {
      id: 102,
      category: 'Tech & Gaming',
      questionText: 'Which programming language was created by Brendan Eich in just 10 days?',
      options: ['Python', 'Java', 'JavaScript', 'C#'],
      correctOptionIndex: 2,
      explanation: 'JavaScript was created by Brendan Eich at Netscape in September 1995.',
      difficulty: 'Easy'
    },
    {
      id: 103,
      category: 'Tech & Gaming',
      questionText: 'What does HTTP stand for?',
      options: [
        'HyperText Transfer Protocol',
        'High Transfer Text Protocol',
        'Hyperlink Text Transmission Process',
        'Home Tool Transfer Program'
      ],
      correctOptionIndex: 0,
      explanation: 'HTTP stands for HyperText Transfer Protocol.',
      difficulty: 'Easy'
    },
    {
      id: 201,
      category: 'Science & Nature',
      questionText: "What element does the chemical symbol 'Au' represent?",
      options: ['Silver', 'Aluminum', 'Gold', 'Argon'],
      correctOptionIndex: 2,
      explanation: "'Au' comes from the Latin word for gold, 'Aurum'.",
      difficulty: 'Easy'
    },
    {
      id: 202,
      category: 'Science & Nature',
      questionText: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum'],
      correctOptionIndex: 2,
      explanation: 'Mitochondria generate most of the chemical energy (ATP) needed by the cell.',
      difficulty: 'Easy'
    },
    {
      id: 301,
      category: 'General Knowledge',
      questionText: 'Which country has the largest surface area in the world?',
      options: ['Canada', 'China', 'United States', 'Russia'],
      correctOptionIndex: 3,
      explanation: 'Russia covers over 17 million square kilometers.',
      difficulty: 'Easy'
    },
    {
      id: 302,
      category: 'General Knowledge',
      questionText: 'How many keys are on a standard acoustic piano?',
      options: ['64', '76', '88', '96'],
      correctOptionIndex: 2,
      explanation: 'A standard piano features 88 keys (52 white, 36 black).',
      difficulty: 'Easy'
    },
    {
      id: 401,
      category: 'Pop Culture & History',
      questionText: 'In which year did the Apollo 11 moon landing occur?',
      options: ['1965', '1969', '1971', '1973'],
      correctOptionIndex: 1,
      explanation: 'Apollo 11 landed Neil Armstrong and Buzz Aldrin on the Moon in July 1969.',
      difficulty: 'Medium'
    }
  ];

  constructor(private http: HttpClient) {}

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError(() => of(['All', 'Tech & Gaming', 'Science & Nature', 'General Knowledge', 'Pop Culture & History']))
    );
  }

  getQuestions(category: string = 'All', count: number = 8): Observable<QuizQuestion[]> {
    const url = `${this.apiUrl}/questions?category=${encodeURIComponent(category)}&count=${count}`;
    return this.http.get<QuizQuestion[]>(url).pipe(
      catchError(() => {
        let filtered = this.fallbackQuestions;
        if (category !== 'All' && category !== '') {
          filtered = this.fallbackQuestions.filter(q => q.category.toLowerCase() === category.toLowerCase());
          if (filtered.length === 0) filtered = this.fallbackQuestions;
        }
        // Shuffle fallback
        return of([...filtered].sort(() => 0.5 - Math.random()).slice(0, count));
      })
    );
  }

  submitAnswer(payload: QuizAnswerSubmission): Observable<QuizAnswerResult> {
    return this.http.post<QuizAnswerResult>(`${this.apiUrl}/answer`, payload).pipe(
      catchError(() => {
        // Fallback local evaluation if backend endpoint fails
        const target = this.fallbackQuestions.find(q => q.id === payload.questionId);
        const correctIndex = target ? (target.correctOptionIndex ?? 0) : 0;
        const isCorrect = payload.selectedOptionIndex === correctIndex;
        const points = isCorrect ? 100 + Math.max(0, payload.secondsRemaining) * 15 + payload.currentStreak * 25 : 0;

        return of({
          isCorrect,
          correctOptionIndex: correctIndex,
          pointsEarned: points,
          explanation: target?.explanation || (isCorrect ? 'Great job! Correct answer.' : 'Better luck next time!')
        });
      })
    );
  }
}
