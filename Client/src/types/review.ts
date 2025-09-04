export type ReviewUser = {
	id: string;
	userName: string;
	email?: string;
	imageUrl?: string;
};

export type Review = {
	id: number;
	title: string;
	comment: string;
	rating: number;
	createdAt: string;
	updatedAt?: string;
	productId: string;
	userId: string;
	user: ReviewUser;
};

export type ReviewStats = {
	totalReviews: number;
	averageRating: number;
	ratingDistribution: {
		five: number; four: number; three: number; two: number; one: number;
	}
};
