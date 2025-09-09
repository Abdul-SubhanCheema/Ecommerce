import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../types/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http=inject(HttpClient);
  private router=inject(Router);

    baseUrl="http://localhost:5262/api";


  GetProducts(){
   return this.http.get<Product[]>(this.baseUrl + "/product");
  }
  GetDealsProducts(){
    return this.http.get<Product[]>(this.baseUrl + "/product/deals");
   }

  GetProductById(id: string){
    return this.http.get<Product>(this.baseUrl + "/product/" + id);
  }
    
}
