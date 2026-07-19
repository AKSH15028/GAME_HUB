export interface Card {
  cardId: number;
  suit: string;
  rank: string;
  themeColor: string;
  textColor: string;
  isFlipped?: boolean; // We add this locally on the frontend to track flip states!
}

export interface GameSession {
  gameSessionId: string;
  targetCard: Card;
  gridCards: Card[];
}

export interface GuessPayload {
  gameSessionId: string;
  selectedCardId: number;
  secondsRemaining: number;
  username: string;
}

export interface GuessResult {
  isCorrect: boolean;
  correctCardId: number;
  pointsEarned: number;
  currentScore: number;
  currentStreak: number;
  strikes: number;
  isGameOver: boolean;
}