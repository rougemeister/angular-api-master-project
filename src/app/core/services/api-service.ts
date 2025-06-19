import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, throwError, of } from 'rxjs';
import { map, catchError, retry, tap } from 'rxjs/operators';

import { API_URL } from '../constants/contants';
import { Post, PostWithImage, Comment } from '../model/model';
import { ErrorHandlerService } from './error-handler-service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);

  private readonly CACHE_KEY = 'cachedPosts';
  private readonly CACHE_TIME_KEY = 'cacheTimestamp';
  private readonly LOCAL_POSTS_KEY = 'localPosts'; 
  private readonly CACHE_DURATION = 5 * 60 * 1000; 
  private nextLocalId = 101; // Start local IDs from 101

  private handleError = (operation: string) => (error: HttpErrorResponse) => {
    console.error(`${operation} failed:`, error);
    const message = this.errorHandler.getErrorMessage(error);
    return throwError(() => new Error(message));
  };

  
  private cachePosts(posts: PostWithImage[]): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(posts));
    localStorage.setItem(this.CACHE_TIME_KEY, Date.now().toString());
  }

  private getCachedPosts(): PostWithImage[] {
    const timestamp = localStorage.getItem(this.CACHE_TIME_KEY);
    if (!timestamp || Date.now() - +timestamp > this.CACHE_DURATION) {
      this.clearCache();
      return [];
    }

    const cached = localStorage.getItem(this.CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }


  private getLocalPosts(): PostWithImage[] {
    const localPosts = localStorage.getItem(this.LOCAL_POSTS_KEY);
    return localPosts ? JSON.parse(localPosts) : [];
  }

  private saveLocalPosts(posts: PostWithImage[]): void {
    localStorage.setItem(this.LOCAL_POSTS_KEY, JSON.stringify(posts));
  }

  private getAllPosts(): PostWithImage[] {
    const cached = this.getCachedPosts();
    const local = this.getLocalPosts();
 
    return [...local, ...cached].sort((a, b) => b.id - a.id);
  }

  private isLocalPost(id: number): boolean {
    return id >= 101; 
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.CACHE_TIME_KEY);
  }

  clearLocalPosts(): void {
    localStorage.removeItem(this.LOCAL_POSTS_KEY);
  }

 
  getPostsWithImages(): Observable<PostWithImage[]> {
    const allPosts = this.getAllPosts();
    if (allPosts.length) return of(allPosts);

    return this.http.get<Post[]>(API_URL).pipe(
      retry(2),
      map(posts => posts.map(post => ({
        ...post,
        imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        comments: []
      }))),
      tap(posts => this.cachePosts(posts)),
      map(posts => this.getAllPosts()), 
      catchError(this.handleError('getPostsWithImages'))
    );
  }

  getPaginatedPostsWithImages(page: number, limit: number): Observable<PostWithImage[]> {
    const start = (page - 1) * limit;
    const allPosts = this.getAllPosts();
    
    if (allPosts.length >= start + limit) {
      return of(allPosts.slice(start, start + limit));
    }

    const params = new HttpParams().set('_page', page).set('_limit', limit);
    return this.http.get<Post[]>(API_URL, { params }).pipe(
      retry(2),
      map(posts => posts.map(post => ({
        ...post,
        imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
        comments: []
      }))),
      tap(fetched => {
        const cached = this.getCachedPosts();
        const updated = [...fetched, ...cached.filter(c => !fetched.find(f => f.id === c.id))];
        this.cachePosts(updated);
      }),
      map(() => this.getAllPosts().slice(start, start + limit)),
      catchError(this.handleError('getPaginatedPostsWithImages'))
    );
  }

  getPostByIdWithImage(id: number): Observable<PostWithImage> {
 
    if (this.isLocalPost(id)) {
      const localPost = this.getLocalPosts().find(p => p.id === id);
      if (localPost) return of(localPost);
    }

  
    const cached = this.getCachedPosts().find(p => p.id === id);
    if (cached) return of(cached);

   
    if (!this.isLocalPost(id)) {
      return this.http.get<Post>(`${API_URL}/${id}`).pipe(
        retry(2),
        map(post => ({
          ...post,
          imageUrl: `https://picsum.photos/seed/${post.id}/600/400`,
          comments: []
        })),
        catchError(this.handleError('getPostByIdWithImage'))
      );
    }

    return throwError(() => new Error('Post not found'));
  }

  getPostByIdWithImageAndComments(id: number): Observable<PostWithImage> {
    const post$ = this.getPostByIdWithImage(id);
    

    if (!this.isLocalPost(id)) {
      const comments$ = this.http.get<Comment[]>(`${API_URL}/${id}/comments`);
      return forkJoin([post$, comments$]).pipe(
        map(([post, comments]) => ({ ...post, comments })),
        catchError(this.handleError('getPostByIdWithImageAndComments'))
      );
    }

  
    return post$;
  }

  createPost(post: Post): Observable<Post> {

    const newPost: PostWithImage = {
      ...post,
      id: this.nextLocalId++,
      imageUrl: `https://picsum.photos/seed/${this.nextLocalId - 1}/600/400`,
      comments: []
    };

    const localPosts = this.getLocalPosts();
    this.saveLocalPosts([newPost, ...localPosts]);


    return this.http.post<Post>(API_URL, post).pipe(
      map(() => newPost), 
      catchError(() => of(newPost)) 
    );
  }

  updatePost(id: number, updatedPost: Post): Observable<Post> {
    if (this.isLocalPost(id)) {
   
      const localPosts = this.getLocalPosts();
      const index = localPosts.findIndex(p => p.id === id);
      
      if (index === -1) {
        return throwError(() => new Error('Post not found'));
      }

      const updated: PostWithImage = {
        ...updatedPost,
        id,
        imageUrl: `https://picsum.photos/seed/${id}/600/400`,
        comments: localPosts[index].comments || []
      };

      localPosts[index] = updated;
      this.saveLocalPosts([...localPosts]);
      
      return of(updated);
    }

    return this.http.put<Post>(`${API_URL}/${id}`, updatedPost).pipe(
      tap(() => {
      
        const cached = this.getCachedPosts();
        const index = cached.findIndex(p => p.id === id);
        if (index !== -1) {
          const updated: PostWithImage = {
            ...updatedPost,
            id,
            imageUrl: `https://picsum.photos/seed/${id}/600/400`,
            comments: cached[index].comments || []
          };
          cached[index] = updated;
          this.cachePosts([...cached]);
        }
      }),
      catchError((error) => {
       
        console.warn('API update failed, updating locally:', error);
        
     
        const post = this.getCachedPosts().find(p => p.id === id);
        if (post) {
          const updatedLocal: PostWithImage = {
            ...updatedPost,
            id,
            imageUrl: post.imageUrl,
            comments: post.comments || []
          };
          
          const localPosts = this.getLocalPosts();
          this.saveLocalPosts([updatedLocal, ...localPosts]);
          
          // Remove from cache
          const cached = this.getCachedPosts().filter(p => p.id !== id);
          this.cachePosts(cached);
          
          return of(updatedLocal);
        }
        
        return throwError(() => new Error('Failed to update post'));
      })
    );
  }

  deletePost(id: number): Observable<void> {
  const isLocal = this.isLocalPost(id);

  if (isLocal) {
  
    const updatedLocal = this.getLocalPosts().filter(p => p.id !== id);
    this.saveLocalPosts(updatedLocal);
  } else {
    const updatedCache = this.getCachedPosts().filter(p => p.id !== id);
    this.cachePosts(updatedCache);
  }


  if (!isLocal) {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => console.log(`Deleted server post ID: ${id}`)),
      catchError(err => {
        console.warn(`Failed to delete on server, removed from cache only.`, err);
        return of(undefined); 
      })
    );
  }

  return of(undefined); 
}

 
  addCommentToPost(postId: number, comment: Comment): Observable<Comment> {
    const newComment: Comment = {
      ...comment,
      id: Date.now(), 
      postId
    };

    
    if (this.isLocalPost(postId)) {
      const localPosts = this.getLocalPosts();
      const index = localPosts.findIndex(p => p.id === postId);
      if (index !== -1) {
        localPosts[index].comments = [...(localPosts[index].comments || []), newComment];
        this.saveLocalPosts([...localPosts]);
        console.log('Comment added to local post:', postId, newComment);
      } else {
        return throwError(() => new Error('Local post not found'));
      }
    } else {
      const cached = this.getCachedPosts();
      const index = cached.findIndex(p => p.id === postId);
      if (index !== -1) {
        cached[index].comments = [...(cached[index].comments || []), newComment];
        this.cachePosts([...cached]);
        console.log('Comment added to cached post:', postId, newComment);
      } else {
        return throwError(() => new Error('Cached post not found'));
      }
    }

    return of(newComment);
  }
}