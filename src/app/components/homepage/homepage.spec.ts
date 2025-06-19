import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Homepage } from './homepage';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Homepage', () => {
  let component: Homepage;
  let fixture: ComponentFixture<Homepage>;
 beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Homepage,                
        HttpClientTestingModule    
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Homepage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
