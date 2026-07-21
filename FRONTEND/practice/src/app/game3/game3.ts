import { Component, OnInit, HostListener } from '@angular/core';
import { GameService, GameSession } from '../services/game2services';

@Component({
  selector: 'app-game3',
  templateUrl: './game3.html',
  styleUrls: ['./game3.css']
})
export class Game3 implements OnInit {
  session!: GameSession;
  loading: boolean = true;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.getSession().subscribe(data => {
      this.session = data;
      // If fetched board is completely blank, spawn initial tiles
      if (this.session.grid.every(val => val === 0)) {
        this.initializeNewGrid();
      } else {
        this.loading = false;
      }
    });
  }

  // Handle slide inputs via keyboard arrow keys
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.loading) return;

    let direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    switch (event.key) {
      case 'ArrowUp': direction = 'UP'; break;
      case 'ArrowDown': direction = 'DOWN'; break;
      case 'ArrowLeft': direction = 'LEFT'; break;
      case 'ArrowRight': direction = 'RIGHT'; break;
      default: return; // Ignore any other key inputs
    }

    event.preventDefault(); 
    this.processMove(direction);
  }

  processMove(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
    const currentGrid = [...this.session.grid];
    const transformedGrid = this.executeSlide(currentGrid, direction);

    // Verify if changes occurred (if no movements or merges happened, it's an invalid move)
    const isMoveValid = JSON.stringify(currentGrid) !== JSON.stringify(transformedGrid);

    if (isMoveValid) {
      // Rule 2: Increment score by exactly 1 per valid sliding move
      this.session.grid = transformedGrid;
      this.session.currentScore += 1;

      // Rule 1: Spawn a random tile (2 or 4) into an empty cell
      this.spawnRandomTile();

      // Transmit updated layouts to API backend
      this.loading = true;
      this.gameService.saveMove(this.session).subscribe(updatedSession => {
        this.session = updatedSession;
        this.loading = false;
      });
    }
  }

  // Pure function mechanics implementing 2048 line manipulation
  executeSlide(grid: number[], direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): number[] {
    let result = [...grid];
    
    for (let i = 0; i < 4; i++) {
      let line: number[] = [];
      
      // 1. Extract columns or rows as flat arrays based on vectors
      for (let j = 0; j < 4; j++) {
        let index = 0;
        if (direction === 'LEFT')  index = i * 4 + j;
        if (direction === 'RIGHT') index = i * 4 + (3 - j);
        if (direction === 'UP')    index = j * 4 + i;
        if (direction === 'DOWN')  index = (3 - j) * 4 + i;
        line.push(result[index]);
      }

      // 2. Compress zero elements out, merge matches, compress zeros again
      line = line.filter(val => val !== 0);
      for (let j = 0; j < line.length - 1; j++) {
        if (line[j] === line[j + 1]) {
          line[j] *= 2;
          line[j + 1] = 0;
        }
      }
      line = line.filter(val => val !== 0);
      while (line.length < 4) {
        line.push(0);
      }

      // 3. Map modified flat structure items back into results matrix
      for (let j = 0; j < 4; j++) {
        let index = 0;
        if (direction === 'LEFT')  index = i * 4 + j;
        if (direction === 'RIGHT') index = i * 4 + (3 - j);
        if (direction === 'UP')    index = j * 4 + i;
        if (direction === 'DOWN')  index = (3 - j) * 4 + i;
        result[index] = line[j];
      }
    }
    return result;
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
    this.spawnRandomTile();
    this.spawnRandomTile();
    this.loading = true;
    this.gameService.saveMove(this.session).subscribe(res => {
      this.session = res;
      this.loading = false;
    });
  }

  // Rule 3: Clear session grid data and reset points to 0 via API
  triggerNewGame() {
    this.loading = true;
    this.gameService.resetGame().subscribe(() => {
      this.initializeNewGrid();
    });
  }

  // Rule 4: Revert 1 step back via API database stack tracking entries
  triggerUndo() {
    if (this.loading) return;
    this.loading = true;
    this.gameService.undoMove().subscribe({
      next: (revertedSession) => {
        this.session = revertedSession;
        this.loading = false;
      },
      error: (err) => {
        console.warn(err.error);
        this.loading = false;
      }
    });
  }
}