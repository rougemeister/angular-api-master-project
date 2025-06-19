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

        this.apiService.getPostByIdWithImageAndComments(this.postId).subscribe(post => {
          this.post = post;
        });
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

      this.post.comments = [...(this.post.comments || []), comment];

      // Reset form
      this.newComment = {
        postId: this.postId,
        id: 0,
        name: '',
        email: '',
        body: ''
      };
    }
  }

  onSubmit(form: any): void {
    if (form.valid) {
      const sanitizedPost: Post = {
        ...this.post,
        title: this.sanitize(this.post.title),
        body: this.sanitize(this.post.body)
      };

      this.apiService.updatePost(this.postId, sanitizedPost).subscribe(() => {
        alert('Post updated successfully!');
        this.router.navigate(['/']);
      });
    }
  }
}
