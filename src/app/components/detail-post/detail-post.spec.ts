import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { DetailPost } from './detail-post';
import { ApiService } from '../../core/services/api-service';
import { PostWithImage } from '../../core/model/model';

describe('DetailPost', () => {
  let component: DetailPost;
  let fixture: ComponentFixture<DetailPost>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockPost: PostWithImage = {
    id: 1,
    title: 'Test Post',
    body: 'Test content',
    imageUrl: 'test-image.jpg',
    comments: [],
    userId: 0
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getPostByIdWithImageAndComments',
      'deletePost'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [DetailPost],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailPost);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch post when id is present in route params', () => {
      // Arrange
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
      mockApiService.getPostByIdWithImageAndComments.and.returnValue(of(mockPost));

      // Act
      component.ngOnInit();

      // Assert
      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(mockApiService.getPostByIdWithImageAndComments).toHaveBeenCalledWith(1);
      expect(component.post).toEqual(mockPost);
    });

    it('should not fetch post when id is not present in route params', () => {
      // Arrange
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

      // Act
      component.ngOnInit();

      // Assert
      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(mockApiService.getPostByIdWithImageAndComments).not.toHaveBeenCalled();
      expect(component.post).toBeUndefined();
    });

    it('should handle string id conversion to number', () => {
      // Arrange
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
      mockApiService.getPostByIdWithImageAndComments.and.returnValue(of(mockPost));

      // Act
      component.ngOnInit();

      // Assert
      expect(mockApiService.getPostByIdWithImageAndComments).toHaveBeenCalledWith(123);
    });
  });

  describe('goToEditPost', () => {
    it('should navigate to edit route when post exists with valid id', () => {
      // Arrange
      component.post = mockPost;

      // Act
      component.goToEditPost();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/edit', 1]);
    });

    it('should not navigate when post is undefined', () => {
      // Arrange
      component.post = undefined;

      // Act
      component.goToEditPost();

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

   
  });

  describe('goBack', () => {
    it('should navigate to posts route', () => {
      // Act
      component.goBack();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['posts']);
    });
  });

  describe('deletePost', () => {
    it('should call deletePost service when post exists with valid id', () => {
      // Arrange
      component.post = mockPost;

      // Act
      component.deletePost();

      // Assert
      expect(mockApiService.deletePost).toHaveBeenCalledWith(1);
    });

    it('should not call deletePost service when post is undefined', () => {
      // Arrange
      component.post = undefined;

      // Act
      component.deletePost();

      // Assert
      expect(mockApiService.deletePost).not.toHaveBeenCalled();
    });

   
  });

  describe('Integration scenarios', () => {
    it('should complete full flow: load post, then navigate to edit', () => {
      // Arrange
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
      mockApiService.getPostByIdWithImageAndComments.and.returnValue(of(mockPost));

      // Act
      component.ngOnInit();
      component.goToEditPost();

      // Assert
      expect(component.post).toEqual(mockPost);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/edit', 1]);
    });

    it('should complete full flow: load post, then delete', () => {
      // Arrange
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
      mockApiService.getPostByIdWithImageAndComments.and.returnValue(of(mockPost));

      // Act
      component.ngOnInit();
      component.deletePost();

      // Assert
      expect(component.post).toEqual(mockPost);
      expect(mockApiService.deletePost).toHaveBeenCalledWith(1);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid id parameters gracefully', () => {
      // Arrange
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('invalid');
      mockApiService.getPostByIdWithImageAndComments.and.returnValue(of(mockPost));

      // Act
      component.ngOnInit();

      // Assert
      expect(mockApiService.getPostByIdWithImageAndComments).toHaveBeenCalledWith(NaN);
    });

    it('should handle zero id', () => {
      // Arrange
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('0');
      mockApiService.getPostByIdWithImageAndComments.and.returnValue(of(mockPost));

      // Act
      component.ngOnInit();

      // Assert
      expect(mockApiService.getPostByIdWithImageAndComments).toHaveBeenCalledWith(0);
    });
  });
});