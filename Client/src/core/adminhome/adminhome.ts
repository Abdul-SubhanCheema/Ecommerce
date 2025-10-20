import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { AddProductModal } from '../add-product-modal/add-product-modal';
import { Product } from '../../types/product';
import { ToastService } from '../services/toast.service';
import { ProductService } from '../services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adminhome',
  imports: [AddProductModal, CommonModule],
  templateUrl: './adminhome.html',
  styleUrl: './adminhome.css'
})
export class Adminhome implements OnInit {
  private toastService = inject(ToastService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  isAddProductModalOpen = false;

  // Dashboard statistics
  totalProducts = 0;
  productsThisMonth = 0;
  productsLastMonth = 0;
  productGrowthPercentage = 0;
  isGrowthPositive = true;
  loading = false; // Initialize to false
  currentMonthName = '';
  lastMonthName = '';
  error: string | null = null;

  ngOnInit(): void {
    console.log('AdminHome component initialized');
    this.initializeDashboard();
    // Ensure initial state is detected
    this.cdr.detectChanges();
  }

  private initializeDashboard(): void {
    // Set initial month names immediately
    const now = new Date();
    const currentMonth = now.getMonth();
    let lastMonth = currentMonth - 1;
    if (lastMonth < 0) {
      lastMonth = 11;
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.currentMonthName = monthNames[currentMonth];
    this.lastMonthName = monthNames[lastMonth];
    
    // Load data with immediate and fallback attempts
    this.loadDashboardData();
    
    // Fallback: if still loading after 8 seconds, reset
    setTimeout(() => {
      if (this.loading) {
        console.warn('Dashboard data loading timeout - resetting loading state');
        this.loading = false;
        this.error = 'Loading timeout - please try refreshing the page';
      }
    }, 8000);
  }

  openAddProductModal(): void {
    this.isAddProductModalOpen = true;
  }

  onAddProductModalClosed(): void {
    this.isAddProductModalOpen = false;
  }

  onProductCreated(product: Product): void {
    // Handle successful product creation
    console.log('Product created successfully:', product);
    this.isAddProductModalOpen = false;
    
    // Show success toast notification
    this.toastService.success(`"${product.productName}" created successfully!`, { 
      icon: '🎆', 
      duration: 4000 
    });

    // Reload dashboard data to reflect new product
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('Loading dashboard data...');
    this.loading = true;
    this.error = null;
    
    // Force change detection for loading state
    this.cdr.detectChanges();
    console.log('Loading state set to:', this.loading);
    
    // Add a small delay to ensure the UI updates
    setTimeout(() => {
      this.productService.GetProducts().subscribe({
        next: (products: Product[]) => {
          console.log('Products loaded successfully:', products?.length || 0);
          this.zone.run(() => {
            if (products && Array.isArray(products)) {
              this.calculateProductStatistics(products);
            } else {
              console.warn('Invalid products data received:', products);
              this.setDefaultValues();
            }
            this.loading = false;
            console.log('UI updated with loading state:', this.loading, 'Total products:', this.totalProducts);
          });
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.zone.run(() => {
            this.loading = false;
            
            // More specific error messages
            if (error.status === 0) {
              this.error = 'Unable to connect to server';
            } else if (error.status === 404) {
              this.error = 'Products endpoint not found';
            } else if (error.status >= 500) {
              this.error = 'Server error occurred';
            } else {
              this.error = `Error: ${error.status} - ${error.message}`;
            }
            
            this.toastService.error(this.error);
            this.setDefaultValues();
          });
        }
      });
    }, 50);
  }

  private setDefaultValues(): void {
    this.totalProducts = 0;
    this.productsThisMonth = 0;
    this.productsLastMonth = 0;
    this.productGrowthPercentage = 0;
    this.isGrowthPositive = true;
  }

  private calculateProductStatistics(products: Product[]): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate last month (handle year boundary)
    let lastMonth = currentMonth - 1;
    let lastMonthYear = currentYear;
    if (lastMonth < 0) {
      lastMonth = 11;
      lastMonthYear = currentYear - 1;
    }

    // Set month names for display
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.currentMonthName = monthNames[currentMonth];
    this.lastMonthName = monthNames[lastMonth];

    this.totalProducts = products.length;

    // Count products added this month
    this.productsThisMonth = products.filter(product => {
      try {
        const createdDate = new Date(product.createdAt);
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear;
      } catch (error) {
        console.warn('Invalid date format for product:', product.id);
        return false;
      }
    }).length;

    // Count products added last month
    this.productsLastMonth = products.filter(product => {
      try {
        const createdDate = new Date(product.createdAt);
        return createdDate.getMonth() === lastMonth && 
               createdDate.getFullYear() === lastMonthYear;
      } catch (error) {
        console.warn('Invalid date format for product:', product.id);
        return false;
      }
    }).length;

    // Calculate growth percentage
    if (this.productsLastMonth === 0) {
      // If no products last month, show 100% growth if we have products this month
      this.productGrowthPercentage = this.productsThisMonth > 0 ? 100 : 0;
      this.isGrowthPositive = this.productsThisMonth > 0;
    } else {
      const growth = ((this.productsThisMonth - this.productsLastMonth) / this.productsLastMonth) * 100;
      this.productGrowthPercentage = Math.abs(Math.round(growth * 10) / 10); // Round to 1 decimal place
      this.isGrowthPositive = growth >= 0;
    }

    console.log('Product Statistics:', {
      totalProducts: this.totalProducts,
      thisMonth: this.productsThisMonth,
      lastMonth: this.productsLastMonth,
      growth: this.productGrowthPercentage,
      isPositive: this.isGrowthPositive
    });
    
    // Force UI update after calculating statistics
    this.cdr.markForCheck();
  }

  // Public method to force refresh the dashboard
  refreshDashboard(): void {
    console.log('Force refreshing dashboard...');
    this.loading = false;
    this.error = null;
    this.setDefaultValues();
    this.initializeDashboard();
  }
}
