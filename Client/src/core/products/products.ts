import { Component, inject } from '@angular/core';
import { ProductService } from '../services/product-service';
import { Observable } from 'rxjs';
import { Product } from '../../types/product';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [AsyncPipe],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {
  productService = inject(ProductService);
  protected product$: Observable<Product[]>;
  constructor() {
    this.product$ = this.productService.GetProducts();
    console.log(this.product$);
  }
}
