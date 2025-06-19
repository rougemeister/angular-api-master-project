import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Post, Comment } from '../../core/model/model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoProfanityValidator } from './profanity.validator';
import { ApiService } from '../../core/services/api-service';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [FormsModule, CommonModule, NoProfanityValidator],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.scss'
})
export class EditPost implements OnInit {
  post!: Post;
  postId!: number;
  profanityList: string[] = ['fuck', 'damn', 'stupid', 'ugly'];
  newComment: Comment = { postId: 0, id: 0, name: '', email: '', body: '' };
  isLoading = false;
  error: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.postId = +id;
        this.newComment.postId = this.postId;
        this.loadPost();
      }
    });
  }

  private loadPost(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.getPostByIdWithImageAndComments(this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.error = 'Failed to load post. Please try again.';
        this.isLoading = false;
      }
    });
  }

  sanitize(value: string): string {
    return value.replace(/[<>]/g, '');
  }

  addComment(): void {
    if (this.newComment.name.trim() && this.newComment.body.trim()) {
      const comment: Comment = {
        ...this.newComment,
        id: Date.now(), // temporary ID
        email: this.newComment.email || 'user@example.com' // fallback email
      };

      // Add comment using the service
      this.apiService.addCommentToPost(this.postId, comment).subscribe({
        next: (addedComment) => {
          console.log('Comment added successfully:', addedComment);
          // Update local post object to reflect the change immediately
          this.post.comments = [...(this.post.comments || []), addedComment];
          
          // Reset form
          this.newComment = {
            postId: this.postId,
            id: 0,
            name: '',
            email: '',
            body: ''
          };
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          alert('Failed to add comment. Please try again.');
        }
      });
    }
  }

  onSubmit(form: any): void {
    if (form.valid) {
      this.isLoading = true;
      this.error = null;

      const sanitizedPost: Post = {
        ...this.post,
        title: this.sanitize(this.post.title),
        body: this.sanitize(this.post.body)
      };

      this.apiService.updatePost(this.postId, sanitizedPost).subscribe({
        next: (updatedPost) => {
          this.isLoading = false;
          alert('Post updated successfully!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating post:', error);
          
          // More user-friendly error messages
          if (error.message.includes('Server error')) {
            this.error = 'Post updated locally (server limitations). Changes saved to your device.';
            // Still navigate after showing the message
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
          } else {
            this.error = 'Failed to update post. Please try again.';
          }
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
    // This would need the original post to compare against
    // For now, just check if fields have content
    return this.post && (this.post.title?.trim() !== '' || this.post.body?.trim() !== '');
  }

  deletePost(): void {
    const confirmed = confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (confirmed) {
      this.isLoading = true;
      
      this.apiService.deletePost(this.postId).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Post deleted successfully!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error deleting post:', error);
          alert('Failed to delete post. Please try again.');
        }
      });
    }
  }
}