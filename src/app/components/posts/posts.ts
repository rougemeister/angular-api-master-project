import { Component, inject } from '@angular/core';
import { Input } from '@angular/core';
import {  PostWithImage } from '../../core/model/model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts',
  imports: [CommonModule],
  templateUrl: './posts.html',
  styleUrl: './posts.scss'
})
export class Posts {
  route = inject(Router);
  @Input() 
  post!: PostWithImage

  goToDetailPost(): void {
    this.route.navigate(['/posts', this.post.id]);
}

 goToEditPost(): void {
    this.route.navigate(['/edit', this.post.id]);
}
}