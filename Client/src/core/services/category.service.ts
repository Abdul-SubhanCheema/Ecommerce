import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Category } from '../../types/product';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5262/api';

  GetCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/Category`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return throwError(() => error);
      })
    );
  }

  GetCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/Category/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching category:', error);
        return throwError(() => error);
      })
    );
  }
}
