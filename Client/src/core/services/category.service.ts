import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Category } from '../../types/product';

export interface CategoryCreateDto {
  name: string;
}

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

  CreateCategory(categoryDto: CategoryCreateDto): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/Category`, categoryDto).pipe(
      catchError(error => {
        console.error('Error creating category:', error);
        return throwError(() => error);
      })
    );
  }

  UpdateCategory(id: number, categoryDto: CategoryCreateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/Category/${id}`, categoryDto).pipe(
      catchError(error => {
        console.error('Error updating category:', error);
        return throwError(() => error);
      })
    );
  }

  DeleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Category/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting category:', error);
        return throwError(() => error);
      })
    );
  }
}
