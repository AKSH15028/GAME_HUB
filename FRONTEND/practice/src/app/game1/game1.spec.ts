import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Game1 } from './game1';

describe('Game1', () => {
  let component: Game1;
  let fixture: ComponentFixture<Game1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Game1],
    }).compileComponents();

    fixture = TestBed.createComponent(Game1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
