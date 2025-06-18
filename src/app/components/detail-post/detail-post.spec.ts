import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailPost } from './detail-post';

describe('DetailPost', () => {
  let component: DetailPost;
  let fixture: ComponentFixture<DetailPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailPost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailPost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
