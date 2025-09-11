import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Photo {
  id: number;
  url: string;
  productId: string;
}

export interface PhotoCreateDto {
  url: string;
  productId: string;
}

export interface PhotoUpdateDto {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5262/api/photo';

  getProductPhotos(productId: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.baseUrl}/product/${productId}`);
  }

  getPhoto(id: number): Observable<Photo> {
    return this.http.get<Photo>(`${this.baseUrl}/${id}`);
  }

  updatePhoto(id: number, photoUpdate: PhotoUpdateDto): Observable<Photo> {
    return this.http.put<Photo>(`${this.baseUrl}/${id}`, photoUpdate);
  }

  deletePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addPhoto(photo: PhotoCreateDto): Observable<Photo> {
    return this.http.post<Photo>(this.baseUrl, photo);
  }

  addMultiplePhotos(productId: string, photoUrls: { url: string }[]): Observable<Photo[]> {
    return this.http.post<Photo[]>(`${this.baseUrl}/product/${productId}/batch`, photoUrls);
  }

  deleteAllProductPhotos(productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/product/${productId}/all`);
  }
}
