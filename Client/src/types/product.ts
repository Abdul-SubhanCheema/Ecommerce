export type Photo= {
  id: number;
  url: string;
  publicId?: string; // optional
  productId: string; // FK reference
}

export type Product= {
  id: string;
  productName: string;
  description: string;
  productImageUrl?: string; 
  price: number;
  discount: number;
  quantity: number;
  photos: Photo[];
}