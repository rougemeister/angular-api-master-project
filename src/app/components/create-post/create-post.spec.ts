import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatePost } from './create-post';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api-service';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoProfanityValidator } from '../edit-post/profanity.validator';

describe('CreatePost Component', () => {
  let component: CreatePost;
  let fixture: ComponentFixture<CreatePost>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['createPost']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreatePost, FormsModule, CommonModule, NoProfanityValidator],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
        DomSanitizer,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('#sanitize', () => {
    it('should remove < and > characters from string', () => {
      const dirty = 'Hello <script>alert("XSS")</script>';
      const sanitized = component.sanitize(dirty);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });
  });

  describe('#onSubmit', () => {
    it('should call createPost and navigate on valid form', () => {
      const mockForm = { valid: true };
      component.post.title = 'Hello';
      component.post.body = 'World';
      const mockResponse = { ...component.post, id: 101 };

      apiServiceSpy.createPost.and.returnValue(of(mockResponse));
      spyOn(window, 'alert');

      component.onSubmit(mockForm);

      expect(apiServiceSpy.createPost).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      expect(window.alert).toHaveBeenCalledWith('Post created successfully!');
    });

    it('should not call createPost on invalid form', () => {
      const mockForm = { valid: false };
      component.onSubmit(mockForm);
      expect(apiServiceSpy.createPost).not.toHaveBeenCalled();
    });

    it('should show error alert if createPost fails', () => {
      const mockForm = { valid: true };
      component.post.title = 'Hello';
      component.post.body = 'World';

      apiServiceSpy.createPost.and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'alert');
      spyOn(console, 'error');

      component.onSubmit(mockForm);

      expect(apiServiceSpy.createPost).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Failed to create post. Please try again.');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('#onCancel', () => {
    it('should navigate immediately if no unsaved changes', () => {
      component.post.title = '';
      component.post.body = '';

      component.onCancel();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should confirm and navigate if user agrees', () => {
      component.post.title = 'Unsaved title';
      spyOn(window, 'confirm').and.returnValue(true);

      component.onCancel();
      expect(window.confirm).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should confirm and stay if user cancels', () => {
      component.post.title = 'Unsaved title';
      spyOn(window, 'confirm').and.returnValue(false);

      component.onCancel();
      expect(window.confirm).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('#hasUnsavedChanges', () => {
    it('should return false when both title and body are empty', () => {
      component.post.title = '';
      component.post.body = '';
      expect(component['hasUnsavedChanges']()).toBeFalse();
    });

    it('should return true when title is non-empty', () => {
      component.post.title = 'Draft';
      component.post.body = '';
      expect(component['hasUnsavedChanges']()).toBeTrue();
    });

    it('should return true when body is non-empty', () => {
      component.post.title = '';
      component.post.body = 'Draft body';
      expect(component['hasUnsavedChanges']()).toBeTrue();
    });
  });
});
