import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly apiUrl = 'http://localhost:5262/api'; // API base URL

  // State management
  isSubmitting = signal(false);
  
  constructor(private http: HttpClient) {}

  // Submit contact form
  submitContactForm(formData: ContactFormData): Observable<ContactResponse> {
    // For now, simulate API call since backend endpoint doesn't exist yet
    return this.simulateSubmission(formData);
    
    // When backend is ready, use this:
    // return this.http.post<ContactResponse>(`${this.apiUrl}/contact`, formData)
    //   .pipe(
    //     catchError(error => {
    //       console.error('Contact form submission error:', error);
    //       return of({
    //         success: false,
    //         message: 'Failed to send message. Please try again later.'
    //       });
    //     })
    //   );
  }

  // Simulate form submission for demo purposes
  private simulateSubmission(formData: ContactFormData): Observable<ContactResponse> {
    this.isSubmitting.set(true);
    
    return of({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      ticketId: this.generateTicketId()
    }).pipe(
      delay(2000), // Simulate network delay
      catchError(() => of({
        success: false,
        message: 'Failed to send message. Please try again later.'
      }))
    );
  }

  // Generate a random ticket ID for demo
  private generateTicketId(): string {
    return 'TK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get inquiry types
  getInquiryTypes() {
    return [
      { value: 'general', label: 'General Inquiry' },
      { value: 'support', label: 'Technical Support' },
      { value: 'order', label: 'Order Related' },
      { value: 'return', label: 'Returns & Refunds' },
      { value: 'feedback', label: 'Feedback' },
      { value: 'business', label: 'Business Partnership' }
    ];
  }
}
