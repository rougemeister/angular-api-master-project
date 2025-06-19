import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_URL } from '../constants/contants';
import { Post, PostWithImage, Comment } from '../model/model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  constructor() {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMsg = `Client-side error: ${error.error.message}`;
    } else {
      errorMsg = `Server returned code ${error.status}, message: ${error.message}`;
    }

    console.error(errorMsg);
    return throwError(() => new Error(errorMsg));
  }


  getPostsWithImages(): Observable<PostWithImage[]> {
    return this.http.get<Post[]>(API_URL).pipe(
      map(posts =>
        posts.map(post => ({
          ...post,
          imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        }))
      ),
      catchError(this.handleError)
    );
  }

  getPaginatedPostsWithImages(page: number, limit: number): Observable<PostWithImage[]> {
    const params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());

    return this.http.get<Post[]>(API_URL, { params }).pipe(
      map(posts =>
        posts.map(post => ({
          ...post,
          imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        }))
      ),
      catchError(this.handleError)
    );
  }

  getPostByIdWithImage(id: number): Observable<PostWithImage> {
    return this.http.get<Post>(`${API_URL}/${id}`).pipe(
      map(post => ({
        ...post,
        imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        comments: [],
      })),
      catchError(this.handleError)
    );
  }

  getPostByIdWithImageAndComments(id: number): Observable<PostWithImage> {
    const post$ = this.http.get<Post>(`${API_URL}/${id}`);
    const comments$ = this.http.get<Comment[]>(`${API_URL}/${id}/comments`);

    return forkJoin([post$, comments$]).pipe(
      map(([post, comments]: [Post, Comment[]]) => ({
        ...post,
        imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        comments,
      }) as PostWithImage),
      catchError(this.handleError)
    );
  }


  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(API_URL, post).pipe(
      catchError(this.handleError)
    );
  }



  updatePost(id: number, updatedPost: Post): Observable<Post> {
    return this.http.put<Post>(`${API_URL}/${id}`, updatedPost).pipe(
      catchError(this.handleError)
    );
  }



  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
