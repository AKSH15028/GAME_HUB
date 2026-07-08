import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Game3 } from './game3';

describe('Game3', () => {
  let component: Game3;
  let fixture: ComponentFixture<Game3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Game3],
    }).compileComponents();

    fixture = TestBed.createComponent(Game3);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
