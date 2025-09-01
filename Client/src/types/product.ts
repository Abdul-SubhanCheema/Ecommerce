export type Photo= {
  id: number;
  url: string;
  publicId?: string; 
  productId: string; 
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