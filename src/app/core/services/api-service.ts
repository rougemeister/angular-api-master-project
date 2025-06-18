import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL, ACCESS_KEY } from '../constants/contants';
import { Post, PostWithImage, Comment } from '../model/model';
import { Observable, switchMap, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  constructor() { }

  getPostsWithImages(): Observable<PostWithImage[]> {
      return this.http.get<Post[]>(API_URL).pipe(
        map((posts) =>
          posts.map((post) => ({
            ...post,
            imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
          }))
        )
      );
    }

 
  getPaginatedPostsWithImages(page: number, limit: number): Observable<PostWithImage[]> {
     const params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());

    return this.http.get<Post[]>(API_URL, { params }).pipe(
      map((posts) =>
        posts.map((post) => ({
          ...post,
          imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        }))
      )
    );
  }

  getPostByIdWithImage(id: number): Observable<PostWithImage> {
  return this.http.get<Post>(`${API_URL}/${id}`).pipe(
    map((post) => ({
      ...post,
      imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
      comments: []
    }))
  );
  }

 getPostByIdWithImageAndComments(id: number): Observable<PostWithImage> {
  const post$ = this.http.get<Post>(`${API_URL}/${id}`);
  const comments$ = this.http.get<Comment[]>(`${API_URL}/${id}/comments`);

  return forkJoin([post$, comments$]).pipe(
    map(([post, comments]: [Post, Comment[]]) => ({
      ...post,
      imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
      comments: comments as Comment[]
    }) as PostWithImage)
  );
}


}