import { Component, EventEmitter, Input, Output, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { Product, Category } from '../../types/product';
import { ImageUpload } from '../../layout/image-upload/image-upload';
import { ImageCropper } from '../../layout/image-cropper/image-cropper';

@Component({
  selector: 'app-product-edit-modal',
  imports: [CommonModule, FormsModule, ImageUpload],
  templateUrl: './product-edit-modal.html',
  styleUrl: './product-edit-modal.css'
})
export class ProductEditModal implements OnChanges {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() productUpdated = new EventEmitter<Product>();

  editForm: Partial<Product> = {};
  categories: Category[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  
  // Image cropper properties
  showImageCropper = false;
  selectedImageFile: File | null = null;

  ngOnChanges() {
    if (this.isOpen && this.product) {
      this.editForm = { ...this.product };
      this.loadCategories();
    }
  }

  loadCategories(): void {
    this.categoryService.GetCategories()
      .subscribe({
        next: (categories: Category[]) => {
          this.categories = categories;
        },
        error: (error: any) => {
          console.error('Failed to load categories:', error);
        }
      });
  }

  onImageUploaded(imageUrl: string): void {
    this.editForm.productImageUrl = imageUrl;
    this.successMessage = 'Image uploaded successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  onImageUploadError(error: string): void {
    this.errorMessage = error;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  // Image cropper methods
  onImageSelected(file: File): void {
    this.selectedImageFile = file;
    this.showImageCropper = true;
  }

  onImageCropped(croppedFile: File): void {
    this.showImageCropper = false;
    // Upload the cropped image
    this.uploadCroppedImage(croppedFile);
  }

  onCropperCancelled(): void {
    this.showImageCropper = false;
    this.selectedImageFile = null;
  }

  private uploadCroppedImage(file: File): void {
    if (!this.editForm.id) return;

    this.isLoading = true;
    
    this.productService.UploadProductPhoto(file, this.editForm.id.toString())
      .subscribe({
        next: (response: any) => {
          this.editForm.productImageUrl = response.url;
          this.successMessage = 'Image uploaded and cropped successfully!';
          setTimeout(() => this.successMessage = '', 3000);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Image upload failed:', error);
          this.errorMessage = 'Failed to upload image. Please try again.';
          setTimeout(() => this.errorMessage = '', 5000);
          this.isLoading = false;
        }
      });
  }

  saveProduct(): void {
    if (!this.editForm.id) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare update data
    const updateData = {
      productName: this.editForm.productName,
      description: this.editForm.description,
      price: this.editForm.price,
      discount: this.editForm.discount,
      quantity: this.editForm.quantity,
      brand: this.editForm.brand,
      categoryId: this.editForm.categoryId,
      productImageUrl: this.editForm.productImageUrl
    };

    this.productService.UpdateProduct(this.editForm.id, updateData)
      .subscribe({
        next: (updatedProduct: Product) => {
          this.isSaving = false;
          this.successMessage = 'Product updated successfully!';
          this.productUpdated.emit(updatedProduct);
          setTimeout(() => this.closeModal(), 2000);
        },
        error: (error: any) => {
          this.isSaving = false;
          this.errorMessage = error.error?.message || 'Failed to update product. Please try again.';
        }
      });
  }

  closeModal(): void {
    this.isOpen = false;
    this.editForm = {};
    this.errorMessage = '';
    this.successMessage = '';
    this.modalClosed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
