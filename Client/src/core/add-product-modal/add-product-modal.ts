import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CategoryService, CategoryCreateDto } from '../services/category.service';
import { Category, Product } from '../../types/product';
import { ImageCropper } from '../../layout/image-cropper/image-cropper';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-add-product-modal',
  imports: [CommonModule, FormsModule, ImageCropper],
  templateUrl: './add-product-modal.html',
  styleUrl: './add-product-modal.css',
  standalone: true
})
export class AddProductModal implements OnInit {
  @Input() isOpen = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() productCreated = new EventEmitter<Product>();

  // Services
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  // Form data
  productForm = {
    productName: '',
    description: '',
    price: 0,
    discount: 0,
    quantity: 0,
    brand: '',
    categoryId: null as number | null,
    isActive: true
  };

  // Categories for dropdown
  categories: Category[] = [];
  
  // New category functionality
  showCreateNewCategory = false;
  newCategoryName = '';
  isCreatingCategory = false;
  
  // Category management
  showCategoryManagement = false;
  editingCategoryId: number | null = null;
  editingCategoryName = '';
  isUpdatingCategory = false;
  isDeletingCategory = false;

  // Image upload and cropping
  selectedFile: File | null = null;
  productImageUrl: string | null = null;
  showImageCropper = false;
  isDragOver = false;
  isSubmitting = false;
  errorMessage = '';
  fileInputKey = 0;

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.GetCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.error('Failed to load categories');
      }
    });
  }

  // Toggle between selecting existing category and creating new one
  toggleCategoryMode(): void {
    this.showCreateNewCategory = !this.showCreateNewCategory;
    if (this.showCreateNewCategory) {
      this.productForm.categoryId = null;
      this.newCategoryName = '';
    } else {
      this.newCategoryName = '';
    }
  }

  // Create new category
  createNewCategory(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.newCategoryName.trim()) {
      this.toastService.warning('Please enter a category name');
      return;
    }

    this.isCreatingCategory = true;
    const categoryDto: CategoryCreateDto = {
      name: this.newCategoryName.trim()
    };

    this.categoryService.CreateCategory(categoryDto).subscribe({
      next: (newCategory) => {
        this.categories.push(newCategory);
        this.productForm.categoryId = newCategory.id;
        this.toastService.success(`Category '${newCategory.name}' created successfully!`, { icon: '📁' });
        this.showCreateNewCategory = false;
        this.newCategoryName = '';
        this.isCreatingCategory = false;
      },
      error: (error) => {
        console.error('Error creating category:', error);
        let errorMessage = 'Failed to create category';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        this.toastService.error(errorMessage, { icon: '❌' });
        this.isCreatingCategory = false;
      }
    });
  }

  // Handle file selection for product image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
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
    this.showImageCropper = true;
  }

  onImageCropped(croppedFile: File): void {
    this.showImageCropper = false;
    this.selectedFile = croppedFile;
    // Create preview URL for the cropped image
    this.productImageUrl = URL.createObjectURL(croppedFile);
  }

  onCropCancelled(): void {
    this.showImageCropper = false;
    this.selectedFile = null;
    this.resetFileInput();
  }

  private resetFileInput(): void {
    this.fileInputKey++;
    const fileInput = document.getElementById('productImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('productImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.productImageUrl = null;
    this.resetFileInput();
  }

  onSubmit(): void {
    // If user is in create new category mode but hasn't created it yet
    if (this.showCreateNewCategory && this.newCategoryName.trim() && !this.productForm.categoryId) {
      this.toastService.warning('Please create the category first or switch to select an existing category');
      return;
    }

    if (!this.isValidForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Create product first
    this.productService.CreateProduct(this.productForm).subscribe({
      next: (createdProduct) => {
        if (this.selectedFile) {
          // Upload image after product creation
          this.uploadProductImage(createdProduct.id, createdProduct);
        } else {
          // No image to upload, complete the process
          this.productCreated.emit(createdProduct);
          this.closeModal();
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.errorMessage = 'Failed to create product. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  private uploadProductImage(productId: string, product: Product): void {
    if (!this.selectedFile) return;

    this.productService.SetMainProductImage(this.selectedFile, productId).subscribe({
      next: (response) => {
        // Update the product with the new image
        product.productImageUrl = response.Url || response.url || response;
        this.productCreated.emit(product);
        this.closeModal();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error uploading product image:', error);
        // Product was created but image upload failed
        // Still emit the product creation event
        this.productCreated.emit(product);
        this.closeModal();
        this.isSubmitting = false;
        // Could show a warning that image upload failed
      }
    });
  }

  private isValidForm(): boolean {
    if (!this.productForm.productName.trim()) {
      this.errorMessage = 'Product name is required.';
      return false;
    }
    if (!this.productForm.description.trim()) {
      this.errorMessage = 'Description is required.';
      return false;
    }
    if (this.productForm.price <= 0) {
      this.errorMessage = 'Price must be greater than 0.';
      return false;
    }
    if (this.productForm.quantity < 0) {
      this.errorMessage = 'Quantity cannot be negative.';
      return false;
    }
    if (!this.productForm.categoryId) {
      this.errorMessage = 'Please select a category or create a new one.';
      return false;
    }
    if (this.showCreateNewCategory && !this.newCategoryName.trim()) {
      this.errorMessage = 'Please enter a category name or switch to select existing category.';
      return false;
    }
    return true;
  }

  closeModal(): void {
    this.resetForm();
    this.modalClosed.emit();
  }

  private resetForm(): void {
    this.productForm = {
      productName: '',
      description: '',
      price: 0,
      discount: 0,
      quantity: 0,
      brand: '',
      categoryId: null,
      isActive: true
    };
    this.selectedFile = null;
    this.productImageUrl = null;
    this.showImageCropper = false;
    this.errorMessage = '';
    this.isSubmitting = false;
    this.showCreateNewCategory = false;
    this.newCategoryName = '';
    this.isCreatingCategory = false;
    this.showCategoryManagement = false;
    this.editingCategoryId = null;
    this.editingCategoryName = '';
    this.resetFileInput();
  }

  // Category Management Methods
  toggleCategoryManagement(): void {
    this.showCategoryManagement = !this.showCategoryManagement;
    this.editingCategoryId = null;
    this.editingCategoryName = '';
  }

  startEditCategory(category: Category): void {
    this.editingCategoryId = category.id;
    this.editingCategoryName = category.name;
  }

  cancelEditCategory(): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
  }

  updateCategory(categoryId: number): void {
    if (!this.editingCategoryName.trim()) {
      this.toastService.warning('Please enter a category name');
      return;
    }

    this.isUpdatingCategory = true;
    const categoryDto: CategoryCreateDto = {
      name: this.editingCategoryName.trim()
    };

    this.categoryService.UpdateCategory(categoryId, categoryDto).subscribe({
      next: () => {
        // Update the category in the local array
        const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
          this.categories[categoryIndex].name = this.editingCategoryName.trim();
        }
        
        this.toastService.success('Category updated successfully!', { icon: '✏️' });
        this.editingCategoryId = null;
        this.editingCategoryName = '';
        this.isUpdatingCategory = false;
      },
      error: (error) => {
        console.error('Error updating category:', error);
        let errorMessage = 'Failed to update category';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        this.toastService.error(errorMessage, { icon: '❌' });
        this.isUpdatingCategory = false;
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    this.isDeletingCategory = true;

    this.categoryService.DeleteCategory(category.id).subscribe({
      next: () => {
        // Remove the category from the local array
        this.categories = this.categories.filter(c => c.id !== category.id);
        
        // If the deleted category was selected, clear the selection
        if (this.productForm.categoryId === category.id) {
          this.productForm.categoryId = null;
        }

        this.toastService.success(`Category "${category.name}" deleted successfully!`, { icon: '🗑️' });
        this.isDeletingCategory = false;
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        let errorMessage = 'Failed to delete category';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        this.toastService.error(errorMessage, { icon: '❌' });
        this.isDeletingCategory = false;
      }
    });
  }
}