import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, GameSession } from '../services/game2services';

@Component({
  selector: 'app-game3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game3.html',
  styleUrls: ['./game3.css']
})
export class Game3 implements OnInit {
  session: GameSession = {
    id: '11111111-1111-1111-1111-111111111111',
    grid: new Array(16).fill(0),
    currentScore: 0
  };

  highScore: number = 0;
  movesCount: number = 0;
  loading: boolean = false;
  isGameOver: boolean = false;
  isVictory: boolean = false;
  victoryDismissed: boolean = false;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    const savedHighScore = typeof localStorage !== 'undefined' ? localStorage.getItem('2048_highScore') : null;
    if (savedHighScore) {
      this.highScore = parseInt(savedHighScore, 10) || 0;
    }

    this.fetchSession();
  }

  fetchSession(): void {
    this.loading = true;
    this.gameService.getSession().subscribe({
      next: (data) => {
        this.session = data;
        this.loading = false;

        if (!this.session.grid || this.session.grid.every(val => val === 0)) {
          this.initializeNewGrid();
        } else {
          this.checkGameStatus();
        }
      },
      error: () => {
        this.loading = false;
        this.initializeNewGrid();
      }
    });
  }

  // Handle slide inputs via keyboard arrow keys & WASD
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isGameOver) return;

    let direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'RIGHT';
        break;
    }

    if (direction) {
      event.preventDefault();
      this.processMove(direction);
    }
  }

  processMove(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
    if (this.isGameOver) return;

    const currentGrid = [...this.session.grid];
    const { newGrid, pointsGained } = this.executeSlide(currentGrid, direction);

    // Verify if changes occurred
    const isMoveValid = JSON.stringify(currentGrid) !== JSON.stringify(newGrid);

    if (isMoveValid) {
      // 1. Immediately apply grid transformation & score update on frontend
      this.session.grid = newGrid;
      this.session.currentScore += pointsGained;
      this.movesCount += 1;

      if (this.session.currentScore > this.highScore) {
        this.highScore = this.session.currentScore;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('2048_highScore', this.highScore.toString());
        }
      }

      // 2. Spawn a random tile (2 or 4) into an empty cell
      this.spawnRandomTile();

      // 3. Evaluate Victory & Game Over status immediately
      this.checkGameStatus();

      // 4. Save to backend asynchronously in the background WITHOUT setting loading = true or blocking input
      this.gameService.saveMove(this.session).subscribe({
        next: (updatedSession) => {
          // Sync ID if needed
          if (updatedSession && updatedSession.id) this.session.id = updatedSession.id;
        },
        error: () => {
          // Ignore background sync errors so gameplay remains silky smooth
        }
      });
    }
  }

  executeSlide(grid: number[], direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): { newGrid: number[], pointsGained: number } {
    let result = [...grid];
    let pointsGained = 0;
    
    for (let i = 0; i < 4; i++) {
      let line: number[] = [];
      
      for (let j = 0; j < 4; j++) {
        let index = 0;
        if (direction === 'LEFT')  index = i * 4 + j;
        if (direction === 'RIGHT') index = i * 4 + (3 - j);
        if (direction === 'UP')    index = j * 4 + i;
        if (direction === 'DOWN')  index = (3 - j) * 4 + i;
        line.push(result[index]);
      }

      line = line.filter(val => val !== 0);
      for (let j = 0; j < line.length - 1; j++) {
        if (line[j] === line[j + 1]) {
          line[j] *= 2;
          pointsGained += line[j];
          line[j + 1] = 0;
        }
      }
      line = line.filter(val => val !== 0);
      while (line.length < 4) {
        line.push(0);
      }

      for (let j = 0; j < 4; j++) {
        let index = 0;
        if (direction === 'LEFT')  index = i * 4 + j;
        if (direction === 'RIGHT') index = i * 4 + (3 - j);
        if (direction === 'UP')    index = j * 4 + i;
        if (direction === 'DOWN')  index = (3 - j) * 4 + i;
        result[index] = line[j];
      }
    }
    return { newGrid: result, pointsGained };
  }

  spawnRandomTile() {
    const emptyIndices: number[] = [];
    this.session.grid.forEach((val, idx) => { if (val === 0) emptyIndices.push(idx); });

    if (emptyIndices.length > 0) {
      const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      this.session.grid[randomIdx] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  initializeNewGrid() {
    this.session.grid = new Array(16).fill(0);
    this.session.currentScore = 0;
    this.movesCount = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.victoryDismissed = false;

    this.spawnRandomTile();
    this.spawnRandomTile();

    this.gameService.saveMove(this.session).subscribe({
      next: (res) => {
        if (res && res.grid) this.session = res;
      },
      error: () => {}
    });
  }

  triggerNewGame() {
    this.initializeNewGrid();
    this.gameService.resetGame().subscribe({
      next: () => {},
      error: () => {}
    });
  }

  triggerUndo() {
    if (this.isGameOver) return;
    this.gameService.undoMove().subscribe({
      next: (revertedSession) => {
        if (revertedSession && revertedSession.grid) {
          this.session = revertedSession;
          this.checkGameStatus();
        }
      },
      error: (err) => {
        console.warn('Undo error:', err);
      }
    });
  }

  checkGameStatus(): void {
    if (!this.victoryDismissed && this.session.grid.includes(2048)) {
      this.isVictory = true;
    }

    const hasEmptyCell = this.session.grid.includes(0);
    if (!hasEmptyCell) {
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = this.session.grid[r * 4 + c];
          if (c < 3 && val === this.session.grid[r * 4 + (c + 1)]) canMove = true;
          if (r < 3 && val === this.session.grid[(r + 1) * 4 + c]) canMove = true;
        }
      }
      if (!canMove) {
        this.isGameOver = true;
      }
    }
  }

  dismissVictoryModal(): void {
    this.isVictory = false;
    this.victoryDismissed = true;
  }
}