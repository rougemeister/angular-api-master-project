import { Component } from '@angular/core';
import { catchError, Observable, of, map } from 'rxjs';
import { OnInit, inject } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import { PostWithImage } from '../../core/model/model';
import { Posts } from "../posts/posts";
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { Pagination } from '../pagination/pagination';
import { Header } from "../header/header";
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [Posts, AsyncPipe, Pagination, Header],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})
export class Homepage implements OnInit {
  posts$!: Observable<PostWithImage[]>;
  apiService = inject(ApiService);
  router = inject(Router)
  currentPage = 1;
  totalPages = 10;
  readonly pageSize = 10;
  error = false;

  searchTerm: string = '';
  selectedCategory: string = '';

  ngOnInit(): void {
    this.loadPage(this.currentPage);

  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.error = false;

    this.posts$ = this.apiService.getPaginatedPostsWithImages(page, this.pageSize).pipe(
      map(posts => this.filterPosts(posts)),
      catchError(err => {
        console.error('Error loading posts:', err);
        this.error = true;
        return of([]);
      })
    );
  }

  filterPosts(posts: PostWithImage[]): PostWithImage[] {
    return posts.filter(post =>
      post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.selectedCategory ? post.body.toLowerCase().includes(this.selectedCategory.toLowerCase()) : true)
    );
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.loadPage(this.currentPage);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.loadPage(this.currentPage);
  }

  navigateToCreateForm(): void {
   this.router.navigate(['/create'])
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadPage(this.currentPage + 1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }
}
