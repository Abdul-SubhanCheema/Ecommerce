import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { PhotoService, Photo } from '../services/photo.service';
import { AccountService } from '../services/account-service';
import { Product } from '../../types/product';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, catchError, of, BehaviorSubject } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ReviewsComponent } from '../reviews/reviews';
import { PhotoEditModal } from '../photo-edit-modal/photo-edit-modal';

@Component({
  selector: 'app-productdetail',
  imports: [AsyncPipe, CommonModule, FormsModule, NgClass, ReviewsComponent, PhotoEditModal],
  templateUrl: './productdetail.html',
  styleUrl: './productdetail.css'
})
export class Productdetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private photoService = inject(PhotoService);
  protected accountService = inject(AccountService);
  private toastService = inject(ToastService);

  product$!: Observable<Product | null>;
  private productSubject = new BehaviorSubject<Product | null>(null);
  productId!: string;
  loading = true;
  error = false;
  selectedImageUrl: string = '';
  currentProduct: Product | null = null;
  currentImageIndex: number = 0;
  selectedQuantity: number = 1;
  activeTab: 'details' | 'reviews' = 'details';
  
  // Navigation context
  sourceePage: string = 'products'; // Default to products
  backButtonLabel: string = 'Back to Products';
  breadcrumbLabel: string = 'Products';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['id'];
      if (this.productId) {
        this.loading = true;
        this.error = false;
        
        // Set up the observable to use our BehaviorSubject
        this.product$ = this.productSubject.asObservable();
        
        // Load the product initially
        this.loadProduct();
      }
    });

    // Check query parameters for source page
    this.route.queryParams.subscribe(queryParams => {
      this.sourceePage = queryParams['source'] || 'products';
      this.updateNavigationLabels();
    });
  }

  private updateNavigationLabels() {
    if (this.sourceePage === 'deals') {
      this.backButtonLabel = 'Back to Deals';
      this.breadcrumbLabel = 'Deals';
    } else {
      this.backButtonLabel = 'Back to Products';
      this.breadcrumbLabel = 'Products';
    }
  }

  private loadProduct() {
    this.productService.GetProductById(this.productId).pipe(
      catchError(err => {
        console.error('Error loading product:', err);
        this.error = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe(product => {
      this.currentProduct = product;
      this.productSubject.next(product); // Update the BehaviorSubject
      this.loading = false;
    });
  }

  goBack() {
    if (this.sourceePage === 'deals') {
      this.router.navigate(['/deals']);
    } else {
      this.router.navigate(['/Products-list']);
    }
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
        this.toastService.error(`Sorry, only ${this.currentProduct.quantity} items available in stock.`, { icon: '📦' });
        return;
      }

      try {
        this.cartService.addToCart(this.currentProduct, this.selectedQuantity);
        const quantityText = this.selectedQuantity === 1 ? '' : `${this.selectedQuantity} `;
        this.toastService.success(`${quantityText}${this.currentProduct.productName} added to cart!`, { icon: '🛍️' });
      } catch (error: any) {
        this.toastService.error(error.message, { icon: '⚠️' });
      }
    } else {
      this.toastService.error('Unable to add product to cart. Please try again.', { icon: '❌' });
    }
  }

  buyNow() {
    // TODO: Implement buy now functionality
    console.log('Buy now for product:', this.productId);
    // Navigate to checkout or show buy now modal
    this.toastService.info('Redirecting to checkout...');
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
    // Remove duplicates by converting to Set and back to array
    return [...new Set(images)];
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

  // Photo management methods
  editPhoto(photoId: number, currentUrl: string): void {
    // Open photo edit modal instead of simple prompt
    this.openPhotoEditModal(photoId, currentUrl);
  }

  deletePhoto(photoId: number, photoUrl: string): void {
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      this.photoService.deletePhoto(photoId).subscribe({
        next: () => {
          // Update current product immediately for instant UI feedback
          if (this.currentProduct && this.currentProduct.photos) {
            this.currentProduct.photos = this.currentProduct.photos.filter(p => p.id !== photoId);
            
            // Reset selected image if it was deleted
            if (this.selectedImageUrl === photoUrl) {
              const remainingImages = this.getAllImages(this.currentProduct);
              if (remainingImages.length > 0) {
                this.selectedImageUrl = remainingImages[0];
                this.currentImageIndex = 0;
              } else {
                this.selectedImageUrl = '';
                this.currentImageIndex = 0;
              }
            }
            
            // Update the BehaviorSubject to trigger UI update immediately
            this.productSubject.next(this.currentProduct);
          }
          
          // Also refresh from server to ensure consistency
          this.refreshProduct();
          this.toastService.success('Photo deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting photo:', error);
          this.toastService.error('Failed to delete photo. Please try again.');
        }
      });
    }
  }

  // Photo edit modal properties
  showPhotoEditModal = false;
  editingPhotoId: number | null = null;
  editingPhotoUrl: string = '';

  openPhotoEditModal(photoId: number, currentUrl: string): void {
    this.editingPhotoId = photoId;
    this.editingPhotoUrl = currentUrl;
    this.showPhotoEditModal = true;
  }

  closePhotoEditModal(): void {
    this.showPhotoEditModal = false;
    this.editingPhotoId = null;
    this.editingPhotoUrl = '';
  }

  onPhotoUpdated(newUrl: string): void {
    // Since the PhotoEditModal handles the delete and upload, 
    // we just need to refresh the product data to get the updated photos
    this.refreshProduct();
    this.closePhotoEditModal();
    this.toastService.success('Photo updated successfully!');
  }

  getPhotoIdFromUrl(photoUrl: string): number | null {
    if (!this.currentProduct || !this.currentProduct.photos) {
      return null;
    }
    
    const photo = this.currentProduct.photos.find(p => p.url === photoUrl);
    return photo ? photo.id : null;
  }

  private refreshProduct(): void {
    if (this.productId) {
      this.productService.GetProductById(this.productId).pipe(
        catchError(err => {
          console.error('Error refreshing product:', err);
          return of(null);
        })
      ).subscribe(product => {
        this.currentProduct = product;
        this.productSubject.next(product); // Update the BehaviorSubject
        
        // Reset image selection if current image was deleted
        if (product && this.selectedImageUrl) {
          const allImages = this.getAllImages(product);
          if (!allImages.includes(this.selectedImageUrl)) {
            this.selectedImageUrl = '';
            this.currentImageIndex = 0;
          }
        }
      });
    }
  }
}
