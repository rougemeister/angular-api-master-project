import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api-service';
import { ErrorHandlerService } from './error-handler-service';
import { API_URL } from '../constants/contants';
import { Post, PostWithImage, Comment } from '../model/model';
import { of, throwError } from 'rxjs';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let mockErrorHandler: jasmine.SpyObj<ErrorHandlerService>;

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    body: 'Test content',
    userId: 1
  };

  const mockPostWithImage: PostWithImage = {
    ...mockPost,
    imageUrl: 'https://picsum.photos/seed/1/600/400',
    comments: []
  };

  const mockComment: Comment = {
    id: 1,
    postId: 1,
    name: 'Test Comment',
    email: 'test@example.com',
    body: 'Test comment body'
  };

  beforeEach(() => {
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['getErrorMessage']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: ErrorHandlerService, useValue: errorHandlerSpy }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    mockErrorHandler = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Constructor and Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Cache Management', () => {
    it('should cache posts correctly', () => {
      const posts = [mockPostWithImage];
      
      (service as any).cachePosts(posts);
      
      const cached = localStorage.getItem('cachedPosts');
      const timestamp = localStorage.getItem('cacheTimestamp');
      
      expect(cached).toBe(JSON.stringify(posts));
      expect(timestamp).toBeTruthy();
    });

    it('should retrieve cached posts when cache is valid', () => {
      const posts = [mockPostWithImage];
      localStorage.setItem('cachedPosts', JSON.stringify(posts));
      localStorage.setItem('cacheTimestamp', Date.now().toString());

      const cachedPosts = (service as any).getCachedPosts();
      
      expect(cachedPosts).toEqual(posts);
    });

    it('should return empty array when cache is expired', () => {
      const posts = [mockPostWithImage];
      localStorage.setItem('cachedPosts', JSON.stringify(posts));
      localStorage.setItem('cacheTimestamp', (Date.now() - 6 * 60 * 1000).toString()); // 6 minutes ago

      const cachedPosts = (service as any).getCachedPosts();
      
      expect(cachedPosts).toEqual([]);
      expect(localStorage.getItem('cachedPosts')).toBeNull();
    });

    it('should clear cache', () => {
      localStorage.setItem('cachedPosts', JSON.stringify([mockPostWithImage]));
      localStorage.setItem('cacheTimestamp', Date.now().toString());

      service.clearCache();

      expect(localStorage.getItem('cachedPosts')).toBeNull();
      expect(localStorage.getItem('cacheTimestamp')).toBeNull();
    });
  });

  describe('Local Posts Management', () => {
    it('should save and retrieve local posts', () => {
      const localPosts = [{ ...mockPostWithImage, id: 101 }];
      
      (service as any).saveLocalPosts(localPosts);
      const retrieved = (service as any).getLocalPosts();
      
      expect(retrieved).toEqual(localPosts);
    });

    it('should identify local posts correctly', () => {
      expect((service as any).isLocalPost(101)).toBe(true);
      expect((service as any).isLocalPost(50)).toBe(false);
    });

    it('should clear local posts', () => {
      localStorage.setItem('localPosts', JSON.stringify([mockPostWithImage]));

      service.clearLocalPosts();

      expect(localStorage.getItem('localPosts')).toBeNull();
    });
  });

  describe('getPostsWithImages', () => {
    it('should return cached posts if available', (done) => {
      const posts = [mockPostWithImage];
      (service as any).cachePosts(posts);

      service.getPostsWithImages().subscribe(result => {
        expect(result).toEqual(posts);
        done();
      });
    });

    it('should fetch posts from API when cache is empty', (done) => {
      service.getPostsWithImages().subscribe(result => {
        expect(result.length).toBe(1);
        expect(result[0]).toEqual(jasmine.objectContaining({
          id: 1,
          title: 'Test Post',
          imageUrl: 'https://picsum.photos/seed/1/600/400',
          comments: []
        }));
        done();
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush([mockPost]);
    });

   
  });

  describe('getPaginatedPostsWithImages', () => {
    it('should return paginated posts from cache when available', (done) => {
      const posts = Array.from({ length: 10 }, (_, i) => ({ 
        ...mockPostWithImage, 
        id: i + 1 
      }));
      (service as any).cachePosts(posts);

      service.getPaginatedPostsWithImages(1, 5).subscribe(result => {
        expect(result.length).toBe(5);
        expect(result[0].id).toBe(10); 
        done();
      });
    });

    it('should fetch paginated posts from API', (done) => {
      service.getPaginatedPostsWithImages(1, 2).subscribe(result => {
        expect(result.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}?_page=1&_limit=2`);
      expect(req.request.method).toBe('GET');
      req.flush([mockPost, { ...mockPost, id: 2 }]);
    });
  });

  describe('getPostByIdWithImage', () => {
    it('should return local post when ID >= 101', (done) => {
      const localPost = { ...mockPostWithImage, id: 101 };
      (service as any).saveLocalPosts([localPost]);

      service.getPostByIdWithImage(101).subscribe(result => {
        expect(result).toEqual(localPost);
        done();
      });
    });

    it('should return cached post when available', (done) => {
      (service as any).cachePosts([mockPostWithImage]);

      service.getPostByIdWithImage(1).subscribe(result => {
        expect(result).toEqual(mockPostWithImage);
        done();
      });
    });

    it('should fetch post from API when not in cache', (done) => {
      service.getPostByIdWithImage(1).subscribe(result => {
        expect(result).toEqual(jasmine.objectContaining({
          id: 1,
          imageUrl: 'https://picsum.photos/seed/1/600/400'
        }));
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });

    it('should throw error for non-existent local post', (done) => {
      service.getPostByIdWithImage(101).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Post not found');
          done();
        }
      });
    });
  });

  describe('getPostByIdWithImageAndComments', () => {
    it('should return local post without fetching comments', (done) => {
      const localPost = { ...mockPostWithImage, id: 101 };
      (service as any).saveLocalPosts([localPost]);

      service.getPostByIdWithImageAndComments(101).subscribe(result => {
        expect(result).toEqual(localPost);
        done();
      });
    });

    it('should fetch post and comments for non-local posts', (done) => {
      service.getPostByIdWithImageAndComments(1).subscribe(result => {
        expect(result).toEqual(jasmine.objectContaining({
          id: 1,
          comments: [mockComment]
        }));
        done();
      });

      const postReq = httpMock.expectOne(`${API_URL}/1`);
      const commentsReq = httpMock.expectOne(`${API_URL}/1/comments`);
      
      postReq.flush(mockPost);
      commentsReq.flush([mockComment]);
    });
  });

  describe('createPost', () => {
    it('should create local post and attempt API call', (done) => {
      const newPost: Post = {
        id: 0, 
        title: 'New Post',
        body: 'New content',
        userId: 1
      };

      service.createPost(newPost).subscribe(result => {
        expect(result.id).toBe(101);
        expect(result.title).toBe('New Post');
        
     
        const localPosts = (service as any).getLocalPosts();
        expect(localPosts.length).toBe(1);
        expect(localPosts[0].id).toBe(101);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      req.flush(newPost);
    });

    it('should handle API failure gracefully', (done) => {
      const newPost: Post = {
        id: 0,
        title: 'New Post',
        body: 'New content',
        userId: 1
      };

      service.createPost(newPost).subscribe(result => {
        expect(result.id).toBe(101);
        const localPosts = (service as any).getLocalPosts();
        expect(localPosts.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('updatePost', () => {
    it('should update local post', (done) => {
      const localPost = { ...mockPostWithImage, id: 101 };
      (service as any).saveLocalPosts([localPost]);

      const updatedPost: Post = {
        id: 101,
        title: 'Updated Title',
        body: 'Updated content',
        userId: 1
      };

      service.updatePost(101, updatedPost).subscribe(result => {
        expect(result.title).toBe('Updated Title');
        
        const localPosts = (service as any).getLocalPosts();
        expect(localPosts[0].title).toBe('Updated Title');
        done();
      });
    });

    it('should update cached post via API', (done) => {
      (service as any).cachePosts([mockPostWithImage]);

      const updatedPost: Post = {
        id: 1,
        title: 'Updated Title',
        body: 'Updated content',
        userId: 1
      };

      service.updatePost(1, updatedPost).subscribe(result => {
        expect(result).toEqual(updatedPost);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedPost);
    });

    it('should handle API failure by updating locally', (done) => {
      (service as any).cachePosts([mockPostWithImage]);

      const updatedPost: Post = {
        id: 1,
        title: 'Updated Title',
        body: 'Updated content',
        userId: 1
      };

      service.updatePost(1, updatedPost).subscribe(result => {
        expect(result.title).toBe('Updated Title');
        
        // Should be moved to local posts
        const localPosts = (service as any).getLocalPosts();
        expect(localPosts.length).toBe(1);
        expect(localPosts[0].title).toBe('Updated Title');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('deletePost', () => {
    it('should delete local post', (done) => {
      const localPost = { ...mockPostWithImage, id: 101 };
      (service as any).saveLocalPosts([localPost]);

      service.deletePost(101).subscribe(() => {
        const localPosts = (service as any).getLocalPosts();
        expect(localPosts.length).toBe(0);
        done();
      });
    });

    it('should delete cached post and call API', (done) => {
      (service as any).cachePosts([mockPostWithImage]);

      service.deletePost(1).subscribe(() => {
        const cachedPosts = (service as any).getCachedPosts();
        expect(cachedPosts.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle API deletion failure gracefully', (done) => {
      (service as any).cachePosts([mockPostWithImage]);

      service.deletePost(1).subscribe(() => {
        // Should still remove from cache even if API fails
        const cachedPosts = (service as any).getCachedPosts();
        expect(cachedPosts.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('addCommentToPost', () => {
    it('should add comment to local post', (done) => {
      const localPost = { ...mockPostWithImage, id: 101 };
      (service as any).saveLocalPosts([localPost]);

      const newComment: Comment = {
        id: 0, // Will be overridden
        postId: 101,
        name: 'New Comment',
        email: 'test@example.com',
        body: 'New comment body'
      };

      service.addCommentToPost(101, newComment).subscribe(result => {
        expect(result.name).toBe('New Comment');
        expect(result.postId).toBe(101);
        
        const localPosts = (service as any).getLocalPosts();
        expect(localPosts[0].comments.length).toBe(1);
        done();
      });
    });

    it('should add comment to cached post', (done) => {
      (service as any).cachePosts([mockPostWithImage]);

      const newComment: Comment = {
        id: 0,
        postId: 1,
        name: 'New Comment',
        email: 'test@example.com',
        body: 'New comment body'
      };

      service.addCommentToPost(1, newComment).subscribe(result => {
        expect(result.name).toBe('New Comment');
        
        const cachedPosts = (service as any).getCachedPosts();
        expect(cachedPosts[0].comments.length).toBe(1);
        done();
      });
    });

   
  });

  describe('Integration Tests', () => {
    it('should handle complete post lifecycle', (done) => {

      const newPost: Post = {
        id: 0,
        title: 'Lifecycle Test',
        body: 'Test content',
        userId: 1
      };

      service.createPost(newPost).subscribe(created => {
        expect(created.id).toBe(101);

        const updatedPost: Post = {
          ...created,
          title: 'Updated Lifecycle Test'
        };

        service.updatePost(created.id, updatedPost).subscribe(updated => {
          expect(updated.title).toBe('Updated Lifecycle Test');

          const comment: Comment = {
            id: 0,
            postId: created.id,
            name: 'Test Comment',
            email: 'test@example.com',
            body: 'Test comment'
          };

          service.addCommentToPost(created.id, comment).subscribe(addedComment => {
            expect(addedComment.name).toBe('Test Comment');

            service.getPostByIdWithImageAndComments(created.id).subscribe(postWithComments => {
              expect(postWithComments.comments?.length).toBe(1);
              expect(postWithComments.title).toBe('Updated Lifecycle Test');

              service.deletePost(created.id).subscribe(() => {
                const localPosts = (service as any).getLocalPosts();
                expect(localPosts.length).toBe(0);
                done();
              });
            });
          });
        });
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(newPost);
    });
  });
});