import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../services/review.service';
import { ReviewStats } from '../../types/review';
import { AccountService } from '../services/account-service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, DatePipe, ReactiveFormsModule, RouterModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css'
})
export class ReviewsComponent implements OnInit {
  @Input() productId!: string;
  rs = inject(ReviewService);
  accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  reviewForm: FormGroup;
  selectedRating = 0;
  submittingReview = false;

  constructor() {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    if (this.productId) {
      this.rs.fetchProductReviews(this.productId);
    }
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  hasUserReviewed(): boolean {
    const currentUser = this.accountService.CurrentUser();
    if (!currentUser) return false;
    
    // Check both Id and id for backward compatibility
    const userId = currentUser.Id || (currentUser as any).id;
    return this.rs.reviews().some(review => review.userId === userId);
  }

  async submitReview(): Promise<void> {
    if (this.reviewForm.invalid || this.submittingReview) return;

    const currentUser = this.accountService.CurrentUser();
    if (!currentUser) {
      alert('You must be logged in to submit a review');
      return;
    }

    console.log('Current user object:', currentUser);
    console.log('User Id:', currentUser.Id);

    // Check both Id and id (for backward compatibility)
    const userId = currentUser.Id || (currentUser as any).id;
    
    if (!userId) {
      alert('User ID not found. Please log out and log in again.');
      return;
    }

    this.submittingReview = true;

    try {
      const formValue = this.reviewForm.value;
      
      const reviewData = {
        Title: formValue.title || '',
        Comment: formValue.comment || '',
        Rating: formValue.rating || this.selectedRating,
        ProductId: this.productId,
        UserId: userId
      };

      console.log('Submitting review data:', reviewData);

      const success = await this.rs.submitReview(reviewData);
      
      if (success) {
        alert('Review submitted successfully!');
        this.resetForm();
        // Refresh reviews
        this.rs.fetchProductReviews(this.productId);
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } catch (error: any) {
      console.error('Review submission error:', error);
      console.error('Error details:', error.error);
      
      let errorMessage = 'Failed to submit review';
      if (error.error?.errors) {
        const validationErrors = Object.entries(error.error.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        errorMessage = `Validation errors:\n${validationErrors}`;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      this.submittingReview = false;
    }
  }

  resetForm(): void {
    this.reviewForm.reset();
    this.selectedRating = 0;
    this.reviewForm.patchValue({ rating: 0 });
  }

  getRatingPercentage(stats: ReviewStats, star: number): number {
    if (stats.totalReviews === 0) return 0;
    
    let count = 0;
    switch (star) {
      case 5: count = stats.ratingDistribution.five; break;
      case 4: count = stats.ratingDistribution.four; break;
      case 3: count = stats.ratingDistribution.three; break;
      case 2: count = stats.ratingDistribution.two; break;
      case 1: count = stats.ratingDistribution.one; break;
      default: count = 0;
    }
    
    return (count / stats.totalReviews) * 100;
  }
}