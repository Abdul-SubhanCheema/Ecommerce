import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropper } from '../../layout/image-cropper/image-cropper';
import { PhotoService } from '../services/photo.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-photo-edit-modal',
  imports: [CommonModule, FormsModule, ImageCropper],
  templateUrl: './photo-edit-modal.html',
  styleUrl: './photo-edit-modal.css',
  standalone: true
})
export class PhotoEditModal {
  @Input() isOpen = false;
  @Input() currentImageUrl = '';
  @Input() photoId: number | null = null;
  @Input() productId: string = '';
  @Output() modalClosed = new EventEmitter<void>();
  @Output() photoUpdated = new EventEmitter<string>();

  // Image upload and cropping
  selectedFile: File | null = null;
  showImageCropper = false;
  isDragOver = false;
  isUploading = false;
  errorMessage = '';
  fileInputKey = 0; // Add this to force recreation of file input

  private photoService = inject(PhotoService);
  private productService = inject(ProductService);

  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('File input change event fired. Files:', input.files);
    if (input.files && input.files[0]) {
      this.handleFileSelection(input.files[0]);
    }
  }

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

  private handleFileSelection(file: File): void {
    console.log('File selected:', file.name, file.type, file.size);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file.';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 10MB.';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    console.log('Opening image cropper with file:', this.selectedFile);
    this.showImageCropper = true;
  }

  onImageCropped(croppedFile: File): void {
    console.log('Image cropped:', croppedFile);
    this.showImageCropper = false;
    this.uploadImage(croppedFile);
  }

  onCropCancelled(): void {
    console.log('Crop cancelled');
    this.showImageCropper = false;
    this.selectedFile = null;
    this.resetFileInput();
  }

  private resetFileInput(): void {
    this.fileInputKey++; // Increment to force recreation
    const fileInput = document.getElementById('photoFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
      // Force recreation of the input to ensure fresh state
      fileInput.type = 'text';
      fileInput.type = 'file';
    }
  }

  private uploadImage(file: File): void {
    if (!this.photoId || !this.productId) {
      this.errorMessage = 'Missing photo ID or product ID';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';

    // First, delete the old photo from the server
    this.photoService.deletePhoto(this.photoId).subscribe({
      next: () => {
        // Then upload the new photo
        this.productService.UploadProductPhoto(file, this.productId).subscribe({
          next: (response: any) => {
            const newImageUrl = response.Url || response.url || response;
            this.photoUpdated.emit(newImageUrl);
            this.isUploading = false;
            this.closeModal();
          },
          error: (error) => {
            console.error('Error uploading new photo:', error);
            this.errorMessage = 'Failed to upload new photo. Please try again.';
            this.isUploading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error deleting old photo:', error);
        this.errorMessage = 'Failed to delete old photo. Please try again.';
        this.isUploading = false;
      }
    });
  }

  closeModal(): void {
    this.selectedFile = null;
    this.showImageCropper = false;
    this.errorMessage = '';
    this.isUploading = false;
    this.resetFileInput();
    this.modalClosed.emit();
  }

  // Trigger file input
  triggerFileInput(): void {
    console.log('Triggering file input, current key:', this.fileInputKey);
    const fileInput = document.getElementById('photoFileInput') as HTMLInputElement;
    if (fileInput) {
      console.log('File input found, clicking...');
      fileInput.click();
    } else {
      console.log('File input not found!');
    }
  }
}
