export type Photo = {
  id: number;
  url: string;
  publicId?: string; 
  productId: string; 
}

export type Category = {
  id: number;
  name: string;
  createdAt: string;
}

export type Review = {
  id: number;
  title: string;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt?: string;
  productId: string;
  userId: string;
  user: {
    id: string;
    userName: string;
    email: string;
    imageUrl?: string;
  };
}

export type Product = {
  id: string;
  productName: string;
  description: string;
  productImageUrl?: string; 
  price: number;
  discount: number;
  quantity: number;
  brand?: string;
  categoryId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  photos: Photo[];
  category?: Category;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}