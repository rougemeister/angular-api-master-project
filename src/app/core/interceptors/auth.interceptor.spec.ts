import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth-service';
import { Observable, of } from 'rxjs';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthInterceptor,
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    interceptor = TestBed.inject(AuthInterceptor);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(console, 'log');
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Constructor', () => {
    it('should create interceptor', () => {
      expect(interceptor).toBeTruthy();
    });

    it('should inject AuthService', () => {
      expect((interceptor as any).auth).toBe(mockAuthService);
    });
  });

  describe('intercept method', () => {
    let mockRequest: HttpRequest<any>;
    let mockHandler: jasmine.SpyObj<HttpHandler>;
    let mockResponse: HttpResponse<any>;

    beforeEach(() => {
      mockRequest = new HttpRequest('GET', '/api/test');
      mockResponse = new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: { data: 'test' }
      });
      mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
    });

    it('should add Authorization header when token exists', () => {
 
      const token = 'test-token-123';
      mockAuthService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(mockResponse));


      interceptor.intercept(mockRequest, mockHandler).subscribe();

      expect(mockHandler.handle).toHaveBeenCalledTimes(1);
      const capturedRequest = mockHandler.handle.calls.first().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should not add Authorization header when token is null', () => {

      mockAuthService.getToken.and.returnValue(null);
      mockHandler.handle.and.returnValue(of(mockResponse));


      interceptor.intercept(mockRequest, mockHandler).subscribe();


      expect(mockHandler.handle).toHaveBeenCalledTimes(1);
      const capturedRequest = mockHandler.handle.calls.first().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBeNull();
    });


    it('should not add Authorization header when token is empty string', () => {

      mockAuthService.getToken.and.returnValue('');
      mockHandler.handle.and.returnValue(of(mockResponse));


      interceptor.intercept(mockRequest, mockHandler).subscribe();


      expect(mockHandler.handle).toHaveBeenCalledTimes(1);
      const capturedRequest = mockHandler.handle.calls.first().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBeNull();
    });

    it('should log outgoing request', () => {
    
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(mockResponse));

      interceptor.intercept(mockRequest, mockHandler).subscribe();


      expect(console.log).toHaveBeenCalledWith('Outgoing Request:', jasmine.any(HttpRequest));
    });

    it('should log incoming HttpResponse', (done) => {

      mockAuthService.getToken.and.returnValue('token');
      mockHandler.handle.and.returnValue(of(mockResponse));

 
      interceptor.intercept(mockRequest, mockHandler).subscribe(() => {

        expect(console.log).toHaveBeenCalledWith('Incoming Response:', mockResponse);
        done();
      });
    });

    it('should not log non-HttpResponse events', (done) => {

      const nonResponseEvent = { type: 0 }; 
      mockAuthService.getToken.and.returnValue('token');
      mockHandler.handle.and.returnValue(of(nonResponseEvent as any));


      interceptor.intercept(mockRequest, mockHandler).subscribe(() => {
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith('Outgoing Request:', jasmine.any(HttpRequest));
        done();
      });
    });

    it('should preserve original request when no token', () => {

      mockAuthService.getToken.and.returnValue(null);
      mockHandler.handle.and.returnValue(of(mockResponse));


      interceptor.intercept(mockRequest, mockHandler).subscribe();

   
      const capturedRequest = mockHandler.handle.calls.first().args[0];
      expect(capturedRequest.url).toBe(mockRequest.url);
      expect(capturedRequest.method).toBe(mockRequest.method);
    });

    it('should preserve all original headers when adding Authorization', () => {
 
      const requestWithHeaders = mockRequest.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value'
        }
      });
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(mockResponse));


      interceptor.intercept(requestWithHeaders, mockHandler).subscribe();


      const capturedRequest = mockHandler.handle.calls.first().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(capturedRequest.headers.get('Content-Type')).toBe('application/json');
      expect(capturedRequest.headers.get('X-Custom-Header')).toBe('custom-value');
    });

    it('should handle multiple requests with different tokens', () => {

      const request1 = new HttpRequest('GET', '/api/test1');
      const request2 = new HttpRequest('POST', '/api/test2', {});
      const token1 = 'token-1';
      const token2 = 'token-2';

      mockHandler.handle.and.returnValue(of(mockResponse));

      mockAuthService.getToken.and.returnValue(token1);
      interceptor.intercept(request1, mockHandler).subscribe();
      
      let capturedRequest = mockHandler.handle.calls.mostRecent().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token1}`);


      mockAuthService.getToken.and.returnValue(token2);
      interceptor.intercept(request2, mockHandler).subscribe();
      
      capturedRequest = mockHandler.handle.calls.mostRecent().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token2}`);
    });
  });

  describe('Integration with HttpClient', () => {
    it('should add Authorization header to actual HTTP requests', () => {

      const token = 'integration-test-token';
      mockAuthService.getToken.and.returnValue(token);

 
      httpClient.get('/api/data').subscribe();


      const req = httpMock.expectOne('/api/data');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({ data: 'test' });
    });

    it('should not add Authorization header when no token in actual HTTP requests', () => {

      mockAuthService.getToken.and.returnValue(null);


      httpClient.post('/api/data', { test: 'data' }).subscribe();


      const req = httpMock.expectOne('/api/data');
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush({ success: true });
    });

    it('should work with different HTTP methods', () => {

      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);


      httpClient.get('/api/get').subscribe();
      let req = httpMock.expectOne('/api/get');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});


      httpClient.post('/api/post', {}).subscribe();
      req = httpMock.expectOne('/api/post');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});


      httpClient.put('/api/put', {}).subscribe();
      req = httpMock.expectOne('/api/put');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});


      httpClient.delete('/api/delete').subscribe();
      req = httpMock.expectOne('/api/delete');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});
    });

    it('should handle requests with existing headers', () => {
      // Arrange
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      const headers = { 'Content-Type': 'application/json' };

      // Act
      httpClient.post('/api/data', { test: 'data' }, { headers }).subscribe();

      // Assert
      const req = httpMock.expectOne('/api/data');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({ success: true });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from AuthService.getToken', () => {
 
      mockAuthService.getToken.and.throwError('Auth service error');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      mockHandler.handle.and.returnValue(of(new HttpResponse()));

      expect(() => {
        interceptor.intercept(new HttpRequest('GET', '/test'), mockHandler).subscribe();
      }).toThrow();
    });

    it('should pass through HTTP errors', (done) => {

      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

 
      httpClient.get('/api/error').subscribe({
        next: () => fail('Should have errored'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });


      const req = httpMock.expectOne('/api/error');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace-only token', () => {
    
      mockAuthService.getToken.and.returnValue('   ');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      mockHandler.handle.and.returnValue(of(new HttpResponse()));

      interceptor.intercept(new HttpRequest('GET', '/test'), mockHandler).subscribe();


      const capturedRequest = mockHandler.handle.calls.first().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBe('Bearer    ');
    });

    it('should handle very long token', () => {

      const longToken = 'a'.repeat(1000);
      mockAuthService.getToken.and.returnValue(longToken);
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      mockHandler.handle.and.returnValue(of(new HttpResponse()));


      interceptor.intercept(new HttpRequest('GET', '/test'), mockHandler).subscribe();


      const capturedRequest = mockHandler.handle.calls.first().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${longToken}`);
    });

    it('should handle special characters in token', () => {

      const specialToken = 'token-with-special-chars!@#$%^&*()';
      mockAuthService.getToken.and.returnValue(specialToken);
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      mockHandler.handle.and.returnValue(of(new HttpResponse()));


      interceptor.intercept(new HttpRequest('GET', '/test'), mockHandler).subscribe();

      const capturedRequest = mockHandler.handle.calls.first().args[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${specialToken}`);
    });
  });
});