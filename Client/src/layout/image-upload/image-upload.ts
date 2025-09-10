import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { ImageCropper } from '../image-cropper/image-cropper';

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule, ImageCropper],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
  standalone: true
})
export class ImageUpload {
  private productService = inject(ProductService);
  
  @Input() currentImageUrl: string = '';
  @Input() productId: string = '';
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() uploadError = new EventEmitter<string>();

  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  successMessage = '';
  
  // Cropper related
  showCropper = false;
  fileForCropping: File | null = null;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  private handleFileSelection(file: File): void {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg','image/.avif'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Please select a valid image file (PNG, JPG, JPEG, AVIF)';
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMessage = 'File size must be less than 5MB';
      return;
    }

    // Show cropper instead of directly uploading
    this.fileForCropping = file;
    this.showCropper = true;
  }

  onImageCropped(croppedFile: File): void {
    this.showCropper = false;
    this.selectedFile = croppedFile;
    this.uploadImage();
  }

  onCropperCancelled(): void {
    this.showCropper = false;
    this.fileForCropping = null;
    this.clearSelection();
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.productId) {
      this.errorMessage = 'Please select a file and ensure product ID is provided';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    // Use ProductService for upload
    console.log('About to upload image with productId:', this.productId);
    this.productService.UploadProductPhoto(this.selectedFile, this.productId)
      .subscribe({
        next: (response: any) => {
         // console.log('Upload successful:', response);
          clearInterval(progressInterval);
          this.uploadProgress = 100;
          this.isUploading = false;
          this.successMessage = 'Image uploaded successfully!';
          this.imageUploaded.emit(response.Url || response.url);
          this.clearSelection();
        },
        error: (error: any) => {
          console.error('Upload error details:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error response:', error.error);
          clearInterval(progressInterval);
          this.isUploading = false;
          this.uploadProgress = 0;
          this.errorMessage = error.error?.message || 'Upload failed. Please try again.';
          this.uploadError.emit(this.errorMessage);
        }
      });
  }

  clearSelection(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
