import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { CartService } from '../services/cart.service';
import { Observable, BehaviorSubject, combineLatest, map, startWith, interval, Subscription } from 'rxjs';
import { Product, Category } from '../../types/product';
import { AsyncPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FeaturedBrand {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  discount: number;
  color: string;
}

@Component({
  selector: 'app-deals',
  imports: [AsyncPipe, RouterLink, NgClass, FormsModule],
  templateUrl: './deals.html',
  styleUrl: './deals.css'
})
export class Deals implements OnInit, OnDestroy {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  cartService = inject(CartService);
  
  protected product$: Observable<Product[]>;
  protected categories$: Observable<Category[]>;
  protected filteredProducts$: Observable<Product[]>;
  
  // Filter and search state
  searchTerm = '';
  selectedCategory = '';
  sortBy = '';
  viewMode: 'grid' | 'list' = 'grid';
  
  // Carousel state
  currentSlide = 0;
  autoSlideSubscription: Subscription | null = null;
  
  featuredBrands: FeaturedBrand[] = [
    {
      id: '1',
      name: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1621768216002-5ac171876625?w=800&h=500&fit=crop',
      description: 'Get amazing deals on iPhones, MacBooks, and accessories with cutting-edge technology',
      discount: 15,
      color: 'from-gray-900 to-black'
    },
    {
      id: '2',
      name: 'Samsung',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=500&fit=crop',
      description: 'Special offers on Galaxy smartphones and smart home electronics',
      discount: 25,
      color: 'from-blue-900 to-blue-700'
    },
    {
      id: '3',
      name: 'Nike',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
      description: 'Exclusive discounts on premium sneakers and athletic sportswear',
      discount: 30,
      color: 'from-orange-900 to-red-800'
    },
    {
      id: '4',
      name: 'Sony',
      imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=500&fit=crop',
      description: 'Cutting-edge electronics, gaming consoles, and entertainment systems',
      discount: 20,
      color: 'from-purple-900 to-indigo-800'
    },
    {
      id: '5',
      name: 'Adidas',
      imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=500&fit=crop',
      description: 'Performance athletic wear and lifestyle products for active individuals',
      discount: 28,
      color: 'from-green-900 to-teal-800'
    }
  ];
  
  private searchSubject = new BehaviorSubject<string>('');
  private categorySubject = new BehaviorSubject<string>('');
  private sortSubject = new BehaviorSubject<string>('');
  
  constructor() {
    this.product$ = this.productService.GetDealsProducts();
    this.categories$ = this.categoryService.GetCategories();
    
    // Combine all filters and create filtered product stream
    this.filteredProducts$ = combineLatest([
      this.product$,
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

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // Carousel methods
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.featuredBrands.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.featuredBrands.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  startAutoSlide(): void {
    this.autoSlideSubscription = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }

  stopAutoSlide(): void {
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
      this.autoSlideSubscription = null;
    }
  }

  onMouseEnter(): void {
    this.stopAutoSlide();
  }

  onMouseLeave(): void {
    this.startAutoSlide();
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

  // Individual filter clearing methods
  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  clearCategory(): void {
    this.selectedCategory = '';
    this.categorySubject.next('');
  }

  clearAllFilters(): void {
    this.clearFilters();
  }

  // Toggle view mode
  toggleView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
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
}
