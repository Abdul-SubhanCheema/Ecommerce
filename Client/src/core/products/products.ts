import { Component, inject } from '@angular/core';
import { ProductService } from '../services/product-service';
import { Observable } from 'rxjs';
import { Product } from '../../types/product';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [AsyncPipe,RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {
  productService = inject(ProductService);
  protected product$: Observable<Product[]>;
  constructor() {
    this.product$ = this.productService.GetProducts();
    
  }

  // Helper method to calculate discounted price
  getDiscountedPrice(originalPrice: number, discount: number): number {
    return originalPrice * (1 - discount / 100);
  }

  // Helper method to check if product has discount
  hasDiscount(discount: number): boolean {
    return discount > 0;
  }
}
