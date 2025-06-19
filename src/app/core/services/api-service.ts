import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, throwError, of } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

import { API_URL } from '../constants/contants';
import { Post, PostWithImage, Comment } from '../model/model';
import { ErrorHandlerService } from './error-handler-service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);

  // Helper for consistent error handling
  private handleError = (operation: string) => (error: HttpErrorResponse) => {
    console.error(`${operation} failed:`, error);
    const message = this.errorHandler.getErrorMessage(error);
    return throwError(() => new Error(message));
  };

  // ────────── GET METHODS ──────────

  getPostsWithImages(): Observable<PostWithImage[]> {
    return this.http.get<Post[]>(API_URL).pipe(
      retry(3),
      map(posts => posts.map(post => ({
        ...post,
        imageUrl: `https://picsum.photos/seed/${post.id}/600/400`
      }))),
      catchError(this.handleError('getPostsWithImages'))
    );
  }

  getPaginatedPostsWithImages(page: number, limit: number): Observable<PostWithImage[]> {
    const params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());

    return this.http.get<Post[]>(API_URL, { params }).pipe(
      retry(3),
      map(posts => posts.map(post => ({
        ...post,
        imageUrl: `https://picsum.photos/seed/${post.id}/600/400`
      }))),
      catchError(this.handleError('getPaginatedPostsWithImages'))
    );
  }

  getPostByIdWithImage(id: number): Observable<PostWithImage> {
    return this.http.get<Post>(`${API_URL}/${id}`).pipe(
      retry(3),
      map(post => ({
        ...post,
        imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        comments: []
      })),
      catchError(this.handleError('getPostByIdWithImage'))
    );
  }

  getPostByIdWithImageAndComments(id: number): Observable<PostWithImage> {
    const post$ = this.http.get<Post>(`${API_URL}/${id}`);
    const comments$ = this.http.get<Comment[]>(`${API_URL}/${id}/comments`);

    return forkJoin([post$, comments$]).pipe(
      retry(3),
      map(([post, comments]) => ({
        ...post,
        imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        comments
      })),
      catchError(this.handleError('getPostByIdWithImageAndComments'))
    );
  }


  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(API_URL, post).pipe(
      retry(1),
      catchError(this.handleError('createPost'))
    );
  }


  updatePost(id: number, updatedPost: Post): Observable<Post> {
    return this.http.put<Post>(`${API_URL}/${id}`, updatedPost).pipe(
      retry(1),
      catchError(this.handleError('updatePost'))
    );
  }



  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      retry(1),
      catchError(this.handleError('deletePost'))
    );
  }
}
