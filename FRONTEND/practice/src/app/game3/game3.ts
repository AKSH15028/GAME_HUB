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

        // If fetched board is completely blank, initialize new grid with 2 random tiles
        if (!this.session.grid || this.session.grid.every(val => val === 0)) {
          this.initializeNewGrid();
        } else {
          this.checkGameStatus();
        }
      },
      error: () => {
        // Fallback local session if backend fails
        this.loading = false;
        this.initializeNewGrid();
      }
    });
  }

  // Handle slide inputs via keyboard arrow keys & WASD
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.loading || this.isGameOver) return;

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
    if (this.loading || this.isGameOver) return;

    const currentGrid = [...this.session.grid];
    const { newGrid, pointsGained } = this.executeSlide(currentGrid, direction);

    // Verify if changes occurred
    const isMoveValid = JSON.stringify(currentGrid) !== JSON.stringify(newGrid);

    if (isMoveValid) {
      this.session.grid = newGrid;
      this.session.currentScore += pointsGained;
      this.movesCount += 1;

      if (this.session.currentScore > this.highScore) {
        this.highScore = this.session.currentScore;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('2048_highScore', this.highScore.toString());
        }
      }

      // Spawn a random tile (2 or 4) into an empty cell
      this.spawnRandomTile();

      this.checkGameStatus();

      // Transmit updated layout to API backend
      this.loading = true;
      this.gameService.saveMove(this.session).subscribe({
        next: (updatedSession) => {
          this.session = updatedSession;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  // Pure function mechanics implementing 2048 line manipulation & score points
  executeSlide(grid: number[], direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): { newGrid: number[], pointsGained: number } {
    let result = [...grid];
    let pointsGained = 0;
    
    for (let i = 0; i < 4; i++) {
      let line: number[] = [];
      
      // 1. Extract columns or rows as flat arrays
      for (let j = 0; j < 4; j++) {
        let index = 0;
        if (direction === 'LEFT')  index = i * 4 + j;
        if (direction === 'RIGHT') index = i * 4 + (3 - j);
        if (direction === 'UP')    index = j * 4 + i;
        if (direction === 'DOWN')  index = (3 - j) * 4 + i;
        line.push(result[index]);
      }

      // 2. Compress zero elements out, merge matching adjacent pairs
      line = line.filter(val => val !== 0);
      for (let j = 0; j < line.length - 1; j++) {
        if (line[j] === line[j + 1]) {
          line[j] *= 2;
          pointsGained += line[j]; // Score increases by merged tile value!
          line[j + 1] = 0;
        }
      }
      line = line.filter(val => val !== 0);
      while (line.length < 4) {
        line.push(0);
      }

      // 3. Map modified flat structure back into grid matrix
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

    this.loading = true;
    this.gameService.saveMove(this.session).subscribe({
      next: (res) => {
        this.session = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  triggerNewGame() {
    this.loading = true;
    this.gameService.resetGame().subscribe({
      next: () => {
        this.initializeNewGrid();
      },
      error: () => {
        this.initializeNewGrid();
      }
    });
  }

  triggerUndo() {
    if (this.loading || this.isGameOver) return;
    this.loading = true;
    this.gameService.undoMove().subscribe({
      next: (revertedSession) => {
        this.session = revertedSession;
        this.loading = false;
        this.checkGameStatus();
      },
      error: (err) => {
        console.warn('Undo error:', err);
        this.loading = false;
      }
    });
  }

  checkGameStatus(): void {
    // Check Victory (2048 tile)
    if (!this.victoryDismissed && this.session.grid.includes(2048)) {
      this.isVictory = true;
    }

    // Check Game Over (No 0s and no adjacent matching tiles)
    const hasEmptyCell = this.session.grid.includes(0);
    if (!hasEmptyCell) {
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = this.session.grid[r * 4 + c];
          // Check right neighbor
          if (c < 3 && val === this.session.grid[r * 4 + (c + 1)]) canMove = true;
          // Check bottom neighbor
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