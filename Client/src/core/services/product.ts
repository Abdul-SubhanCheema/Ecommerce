import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Product {
  private http=inject(HttpClient);
  private router=inject(Router);

    baseUrl="http://localhost:5262/api";

    
}
