import { Component, inject } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { CartService } from '../services/cart.service';
import { Observable, BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { Product, Category } from '../../types/product';
import { AsyncPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../services/account-service';
import { ProductEditModal } from '../product-edit-modal/product-edit-modal';

@Component({
  selector: 'app-products',
  imports: [AsyncPipe, RouterLink, NgClass, FormsModule, ProductEditModal],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  protected accountService = inject(AccountService);
  cartService = inject(CartService);
  
  protected product$: Observable<Product[]>;
  protected categories$: Observable<Category[]>;
  protected filteredProducts$: Observable<Product[]>;
  
  // Filter and search state
  searchTerm = '';
  selectedCategory = '';
  sortBy = '';
  viewMode: 'grid' | 'list' = 'grid';
  
  // Edit modal state
  isEditModalOpen = false;
  selectedProductForEdit: Product | null = null;
  
  private searchSubject = new BehaviorSubject<string>('');
  private categorySubject = new BehaviorSubject<string>('');
  private sortSubject = new BehaviorSubject<string>('');
  private productsSubject = new BehaviorSubject<Product[]>([]);
  
  constructor() {
    this.product$ = this.productService.GetProducts();
    this.categories$ = this.categoryService.GetCategories();
    
    // Initialize products
    this.product$.subscribe(products => {
      this.productsSubject.next(products);
    });
    
    // Combine all filters and create filtered product stream
    this.filteredProducts$ = combineLatest([
      this.productsSubject.asObservable(),
      this.searchSubject.asObservable().pipe(startWith('')),
      this.categorySubject.asObservable().pipe(startWith('')),
      this.sortSubject.asObservable().pipe(startWith(''))
    ]).pipe(
      map(([products, search, category, sort]) => {
        let filtered = [...products];
        
        // Apply search filter
        if (search.trim()) {
          filtered = filtered.filter(product => 
            product.productName.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase()) ||
            product.brand?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Apply category filter
        if (category && category !== '') {
          filtered = filtered.filter(product => 
            product.category?.name === category
          );
        }
        
        // Apply sorting
        switch (sort) {
          case 'price-asc':
            filtered.sort((a, b) => {
              const priceA = this.getDiscountedPrice(a.price, a.discount);
              const priceB = this.getDiscountedPrice(b.price, b.discount);
              return priceA - priceB;
            });
            break;
          case 'price-desc':
            filtered.sort((a, b) => {
              const priceA = this.getDiscountedPrice(a.price, a.discount);
              const priceB = this.getDiscountedPrice(b.price, b.discount);
              return priceB - priceA;
            });
            break;
          case 'name-asc':
            filtered.sort((a, b) => a.productName.localeCompare(b.productName));
            break;
          case 'name-desc':
            filtered.sort((a, b) => b.productName.localeCompare(a.productName));
            break;
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'rating':
            filtered.sort((a, b) => b.averageRating - a.averageRating);
            break;
        }
        
        return filtered;
      })
    );
  }

  // Search functionality
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  // Category filter
  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.categorySubject.next(category);
  }

  // Sort functionality
  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.sortSubject.next(sortBy);
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortBy = '';
    this.searchSubject.next('');
    this.categorySubject.next('');
    this.sortSubject.next('');
  }

  // Helper method to calculate discounted price
  getDiscountedPrice(originalPrice: number, discount: number): number {
    return originalPrice * (1 - discount / 100);
  }

  // Helper method to check if product has discount
  hasDiscount(discount: number): boolean {
    return discount > 0;
  }

  // Helper method to get stock status
  getStockStatus(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    return 'In Stock';
  }

  // Helper method to get stock status color
  getStockStatusColor(quantity: number): string {
    if (quantity === 0) return 'text-red-600';
    if (quantity <= 5) return 'text-yellow-600';
    return 'text-green-600';
  }

  // Check if product is new arrival (within 30 days)
  isNewArrival(createdAt: string): boolean {
    const productDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - productDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }

  // Add product to cart
  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (product.quantity > 0) {
      try {
        this.cartService.addToCart(product, 1);
        alert(`${product.productName} added to cart!`);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('This product is out of stock.');
    }
  }

  // Set view mode (grid or list)
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Edit product functionality
  editProduct(product: Product): void {
    this.selectedProductForEdit = product;
    this.isEditModalOpen = true;
  }

  onEditModalClosed(): void {
    this.isEditModalOpen = false;
    this.selectedProductForEdit = null;
  }

  onProductUpdated(updatedProduct: Product): void {
    // Update the product in the current products list
    const currentProducts = this.productsSubject.value;
    const updatedProducts = currentProducts.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    );
    this.productsSubject.next(updatedProducts);
    
    // Close the modal
    this.onEditModalClosed();
  }
}
