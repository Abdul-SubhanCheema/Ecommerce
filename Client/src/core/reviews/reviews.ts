import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReviewService } from '../services/review.service';
import { ReviewStats } from '../../types/review';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, DatePipe],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css'
})
export class ReviewsComponent implements OnInit {
  @Input() productId!: string;
  rs = inject(ReviewService);

  ngOnInit(): void {
    if (this.productId) {
      this.rs.fetchProductReviews(this.productId);
    }
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