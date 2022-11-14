import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactonComponent } from './transacton.component';

describe('TransactonComponent', () => {
  let component: TransactonComponent;
  let fixture: ComponentFixture<TransactonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
