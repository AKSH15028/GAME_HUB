import { TestBed } from '@angular/core/testing';

import { Game2services } from './game2services';

describe('Game2services', () => {
  let service: Game2services;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Game2services);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
