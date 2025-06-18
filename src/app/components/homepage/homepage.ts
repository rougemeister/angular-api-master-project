import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { OnInit, inject } from '@angular/core';   
import { ApiService } from '../../core/services/api-service';
import { Post, PostWithImage } from '../../core/model/model';
import { Posts } from "../posts/posts";
import { AsyncPipe } from '@angular/common';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-homepage',
  imports: [Posts, AsyncPipe, Pagination],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})
export class Homepage implements OnInit {
 posts$!: Observable<PostWithImage[]>;
 apiService: ApiService = inject(ApiService);
 currentPage: number = 1;
 totalPages: number = 10; 
 readonly pageSize: number = 8; 


  ngOnInit(): void {
    this.loadPage(this.currentPage);
  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.posts$ = this.apiService.getPaginatedPostsWithImages(this.currentPage, this.pageSize);
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
