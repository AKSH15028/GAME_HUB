import { TestBed } from '@angular/core/testing';

import { Game1Service} from './game1services';

describe('Game1', () => {
  let service: Game1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Game1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
