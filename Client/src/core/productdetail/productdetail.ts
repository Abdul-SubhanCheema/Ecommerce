import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../../types/product';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, catchError, of } from 'rxjs';
import { ReviewsComponent } from '../reviews/reviews';

@Component({
  selector: 'app-productdetail',
  imports: [AsyncPipe, CommonModule, FormsModule, NgClass, ReviewsComponent],
  templateUrl: './productdetail.html',
  styleUrl: './productdetail.css'
})
export class Productdetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product$!: Observable<Product | null>;
  productId!: string;
  loading = true;
  error = false;
  selectedImageUrl: string = '';
  currentProduct: Product | null = null;
  currentImageIndex: number = 0;
  selectedQuantity: number = 1;
  activeTab: 'details' | 'reviews' = 'details';

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

        // Subscribe to get the current product for cart operations
        this.product$.subscribe(product => {
          this.currentProduct = product;
          this.loading = false;
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/Products-list']);
  }



  hasDiscount(discount: number): boolean {
    return discount > 0;
  }

  getStockStatus(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    return 'In Stock';
  }

  getStockStatusColor(quantity: number): string {
    if (quantity === 0) return 'text-red-600';
    if (quantity <= 5) return 'text-yellow-600';
    return 'text-green-600';
  }

  addToCart() {
    if (this.currentProduct && this.selectedQuantity > 0) {
      // Check if product is in stock
      if (this.currentProduct.quantity < this.selectedQuantity) {
        alert(`Sorry, only ${this.currentProduct.quantity} items available in stock.`);
        return;
      }

      try {
        this.cartService.addToCart(this.currentProduct, this.selectedQuantity);
        alert(`${this.selectedQuantity} ${this.currentProduct.productName}(s) added to cart!`);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Unable to add product to cart. Please try again.');
    }
  }

  buyNow() {
    // TODO: Implement buy now functionality
    console.log('Buy now for product:', this.productId);
    // Navigate to checkout or show buy now modal
    alert('Redirecting to checkout...');
  }

  // Helper methods
  getDiscountedPrice(originalPrice: number, discount: number): number {
    return originalPrice * (1 - discount / 100);
  }

  getSavingsAmount(originalPrice: number, discount: number): number {
    return originalPrice * (discount / 100);
  }





  isNewArrival(createdAt: string): boolean {
    const productDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - productDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // Consider new if created within 30 days
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
