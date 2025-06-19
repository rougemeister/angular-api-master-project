import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Client-side error: ${error.error.message}`;
    }

    switch (error.status) {
      case 0:
        return 'Network error: Please check your internet connection.';
      case 400:
        return 'Bad Request. Please check your input.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Unexpected error (code ${error.status}): ${error.message}`;
    }
  }
}
