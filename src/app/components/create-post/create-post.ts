import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Post } from '../../core/model/model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoProfanityValidator } from '../edit-post/profanity.validator';
import { ApiService } from '../../core/services/api-service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [FormsModule, CommonModule, NoProfanityValidator],
  templateUrl: './create-post.html',
  styleUrl: './create-post.scss'
})
export class CreatePost {
  post: Post = {
    userId: 1,
    id: 0,
    title: '',
    body: '',
    comments: []
  };
  profanityList: string[] = ['fuck', 'damn', 'stupid', 'ugly'];

  constructor(
    private sanitizer: DomSanitizer,
    private apiService: ApiService,
    private router: Router
  ) {}

  sanitize(value: string): string {
    return value.replace(/[<>]/g, '');
  }

  onSubmit(form: any): void {
    if (form.valid) {
      const sanitizedPost: Post = {
        ...this.post,
        title: this.sanitize(this.post.title),
        body: this.sanitize(this.post.body)
      };

      this.apiService.createPost(sanitizedPost).subscribe({
        next: (createdPost) => {
          alert('Post created successfully!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error creating post:', error);
          alert('Failed to create post. Please try again.');
        }
      });
    }
  }

  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (confirmed) {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  private hasUnsavedChanges(): boolean {
    return this.post.title.trim() !== '' || this.post.body.trim() !== '';
  }
}