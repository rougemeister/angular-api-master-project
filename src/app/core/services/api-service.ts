import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL, ACCESS_KEY } from '../constants/contants';
import { Post, PostWithImage } from '../model/model';
import { Observable, switchMap, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  constructor() { }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(API_URL);
  }
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
}







