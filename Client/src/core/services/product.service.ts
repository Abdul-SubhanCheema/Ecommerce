import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../types/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http=inject(HttpClient);

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

  UpdateProduct(id: string, productData: Partial<Product>){
    return this.http.put<Product>(this.baseUrl + "/product/" + id, productData);
  }

  DeleteProduct(id: string){
    return this.http.delete(this.baseUrl + "/product/" + id);
  }

  UploadProductPhoto(file: File, productId: string){
    console.log('UploadProductPhoto called with:', {
      productId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', productId);
    
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    //console.log('Making request to:', this.baseUrl + "/product/add-photo");
    
    return this.http.post<any>(this.baseUrl + "/product/add-photo", formData);
  }
    
}
