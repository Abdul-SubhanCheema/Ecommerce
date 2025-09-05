import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, ContactFormData } from '../services/contact.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  private contactService = inject(ContactService);

  // Form data
  contactForm: ContactFormData = {
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  };

  // State management
  isSubmitting = signal(false);
  isSubmitted = signal(false);
  submitError = signal('');
  submitSuccess = signal('');

  // Get inquiry types from service
  inquiryTypes = this.contactService.getInquiryTypes();

  // Contact information
  contactInfo = {
    email: 'support@ecommercestore.com',
    phone: '(058234) 45168',
    address: {
      street: 'Qundeel Colony',
      city: 'BAGH',
      state: 'Kashmir',
      zip: '12345',
      country: 'PAK'
    },
    hours: {
      weekdays: 'Monday - Friday: 8:00 AM - 5:00 PM',
      weekend: 'Saturday: 10:00 AM - 4:00 PM',
      closed: 'Sunday: Closed'
    }
  };

  onSubmit() {
    if (!this.isFormValid()) {
      this.submitError.set('Please fill in all required fields.');
      return;
    }

    if (!this.contactService.isValidEmail(this.contactForm.email)) {
      this.submitError.set('Please enter a valid email address.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    this.contactService.submitContactForm(this.contactForm).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.isSubmitted.set(true);
          this.submitSuccess.set(response.message + (response.ticketId ? ` Ticket ID: ${response.ticketId}` : ''));
          this.resetForm();
        } else {
          this.submitError.set(response.message);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitError.set('Failed to send message. Please try again later.');
        console.error('Contact form error:', error);
      }
    });
  }

  private isFormValid(): boolean {
    return !!(
      this.contactForm.name.trim() &&
      this.contactForm.email.trim() &&
      this.contactForm.subject.trim() &&
      this.contactForm.message.trim()
    );
  }

  private resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    };
  }

  resetSubmission() {
    this.isSubmitted.set(false);
    this.submitError.set('');
    this.submitSuccess.set('');
  }
}
