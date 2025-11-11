import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review, ReviewStats } from '../../types/review';

@Injectable({ providedIn: 'root' })
export class ReviewService {
	private http = inject(HttpClient);
	private baseUrl = 'http://localhost:5262/api/review';

	private _loading = signal(false);
	private _error = signal<string | null>(null);
	private _reviews = signal<Review[]>([]);
	private _stats = signal<ReviewStats | null>(null);

	loading = this._loading.asReadonly();
	error = this._error.asReadonly();
	reviews = this._reviews.asReadonly();
	stats = this._stats.asReadonly();

	fetchProductReviews(productId: string) {
		this._loading.set(true);
		this._error.set(null);
		this.http.get<Review[]>(`${this.baseUrl}/product/${productId}`).subscribe({
			next: res => { this._reviews.set(res); this._loading.set(false); },
			error: err => { this._error.set('Failed to load reviews'); console.error(err); this._loading.set(false); }
		});
		// this.http.get<ReviewStats>(`${this.baseUrl}/stats/product/${productId}`).subscribe({
		// 	next: res => this._stats.set(res),
		// 	error: err => console.warn('Stats load failed', err)
		// });
	}

	async submitReview(reviewData: { Title: string; Comment: string; Rating: number; ProductId: string; UserId: string }): Promise<boolean> {
		try {
			const result = await this.http.post<Review>(`${this.baseUrl}`, reviewData).toPromise();
			return !!result;
		} catch (error: any) {
			console.error('Failed to submit review:', error);
			throw new Error(error?.error?.message || 'Failed to submit review');
		}
	}
}
