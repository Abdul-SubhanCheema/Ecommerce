import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product-service';
import { Product } from '../../types/product';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-productdetail',
  imports: [AsyncPipe, CommonModule, FormsModule],
  templateUrl: './productdetail.html',
  styleUrl: './productdetail.css'
})
export class Productdetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  
  product$!: Observable<Product | null>;
  productId!: string;
  loading = true;
  error = false;
  selectedImageUrl: string = '';
  currentImageIndex: number = 0;
  selectedQuantity: number = 1;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['id'];
      if (this.productId) {
        this.loading = true;
        this.error = false;
        this.product$ = this.productService.GetProductById(this.productId).pipe(
          catchError(err => {
            console.error('Error loading product:', err);
            this.error = true;
            this.loading = false;
            return of(null);
          })
        );
      }
    });
  }

  goBack() {
    this.router.navigate(['/Products-list']);
  }

  addToCart() {
    // TODO: Implement add to cart functionality
    console.log('Adding product to cart:', this.productId);
    // You can show a toast notification here
    alert('Product added to cart!');
  }

  buyNow() {
    // TODO: Implement buy now functionality
    console.log('Buy now for product:', this.productId);
    // Navigate to checkout or show buy now modal
    alert('Redirecting to checkout...');
  }

  // Helper method to calculate discounted price
  getDiscountedPrice(originalPrice: number, discount: number): number {
    return originalPrice * (1 - discount / 100);
  }

  // Helper method to calculate savings amount
  getSavingsAmount(originalPrice: number, discount: number): number {
    return originalPrice * (discount / 100);
  }

  // Carousel functionality
  selectImage(imageUrl: string, index: number): void {
    this.selectedImageUrl = imageUrl;
    this.currentImageIndex = index;
  }

  getMainImageUrl(product: Product): string {
    if (this.selectedImageUrl) {
      return this.selectedImageUrl;
    }
    return product.productImageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop';
  }

  getAllImages(product: Product): string[] {
    const images: string[] = [];
    if (product.productImageUrl) {
      images.push(product.productImageUrl);
    }
    if (product.photos && product.photos.length > 0) {
      images.push(...product.photos.map(photo => photo.url));
    }
    return images;
  }

  nextImage(product: Product): void {
    const allImages = this.getAllImages(product);
    if (allImages.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % allImages.length;
      this.selectedImageUrl = allImages[this.currentImageIndex];
    }
  }

  previousImage(product: Product): void {
    const allImages = this.getAllImages(product);
    if (allImages.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 ? allImages.length - 1 : this.currentImageIndex - 1;
      this.selectedImageUrl = allImages[this.currentImageIndex];
    }
  }

  // Quantity functionality
  increaseQuantity(maxQuantity: number): void {
    if (this.selectedQuantity < maxQuantity) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  // Getter/setter for selectedQuantity with validation
  get quantity(): number {
    return this.selectedQuantity;
  }

  set quantity(value: number) {
    if (value >= 1) {
      this.selectedQuantity = value;
    }
  }
}
