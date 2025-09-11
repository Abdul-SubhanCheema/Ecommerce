import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, AfterViewInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-cropper',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './image-cropper.html',
  styleUrl: './image-cropper.css'
})
export class ImageCropper implements AfterViewInit, OnChanges {
  @ViewChild('imageCanvas') imageCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() isOpen = false;
  @Input() imageFile: File | null = null;
  @Output() imageCropped = new EventEmitter<File>();
  @Output() cancelled = new EventEmitter<void>();

  private imageCtx!: CanvasRenderingContext2D;
  private overlayCtx!: CanvasRenderingContext2D;
  private image = new Image();
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  cropSize = 'square';
  isLoading = false;
  isProcessing = false;
  canvasDisplayWidth = 600;
  canvasDisplayHeight = 400;

  cropSizes = [
    { value: 'square', label: 'Square (1:1)' },
    { value: 'wide', label: 'Wide (16:9)' },
    { value: 'portrait', label: 'Portrait (4:5)' },
    { value: 'free', label: 'Free Form' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    console.log('ImageCropper ngAfterViewInit');
    this.initializeCanvases();
  }

  ngOnChanges() {
    console.log('ImageCropper ngOnChanges:', {
      isOpen: this.isOpen,
      hasImageFile: !!this.imageFile,
      hasImageCtx: !!this.imageCtx,
      hasOverlayCtx: !!this.overlayCtx
    });
    
    if (this.isOpen && this.imageFile) {
      // Always reinitialize when modal opens to ensure fresh state
      setTimeout(() => {
        this.forceReinitialize();
      }, 150); // Give enough time for DOM to be ready
    }
  }

  private forceReinitialize() {
    console.log('Force reinitializing image cropper...');
    
    // Reinitialize canvases
    this.initializeCanvases();
    
    // Small delay to ensure canvases are ready
    setTimeout(() => {
      if (this.imageCtx && this.overlayCtx) {
        console.log('Canvases ready, loading image...');
        this.loadImage();
      } else {
        console.error('Canvases still not ready after reinitialization');
      }
    }, 50);
  }

  private initializeCanvases() {
    if (this.imageCanvas && this.overlayCanvas) {
      console.log('Initializing canvases...');
      this.imageCtx = this.imageCanvas.nativeElement.getContext('2d')!;
      this.overlayCtx = this.overlayCanvas.nativeElement.getContext('2d')!;
      
      // Set initial canvas dimensions
      const imageCanvas = this.imageCanvas.nativeElement;
      const overlayCanvas = this.overlayCanvas.nativeElement;
      imageCanvas.width = overlayCanvas.width = this.canvasDisplayWidth;
      imageCanvas.height = overlayCanvas.height = this.canvasDisplayHeight;
      
      if (this.imageFile) {
        this.loadImage();
      }
    } else {
      console.warn('Canvas elements not available yet');
    }
  }

  private loadImage() {
    console.log('loadImage called:', {
      hasImageFile: !!this.imageFile,
      hasImageCtx: !!this.imageCtx,
      hasOverlayCtx: !!this.overlayCtx,
      isOpen: this.isOpen
    });
    
    if (!this.imageFile || !this.imageCtx || !this.overlayCtx) {
      console.warn('Missing requirements for loading image');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // Manually trigger change detection
    
    // Fallback timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Image loading timeout - resetting loading state');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 10000); // 10 second timeout
    
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('FileReader onload fired');
      this.image.onload = () => {
        console.log('Image onload fired:', {
          width: this.image.width,
          height: this.image.height
        });
        clearTimeout(loadingTimeout);
        try {
          this.resetTransform();
          this.updatePreview();
        } catch (error) {
          console.error('Error updating preview:', error);
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges(); // Manually trigger change detection
        }
      };
      this.image.onerror = () => {
        clearTimeout(loadingTimeout);
        console.error('Failed to load image');
        this.isLoading = false;
        this.cdr.detectChanges();
      };
      this.image.src = e.target?.result as string;
      console.log('Image src set:', this.image.src.substring(0, 50) + '...');
    };
    reader.onerror = () => {
      clearTimeout(loadingTimeout);
      console.error('Failed to read file');
      this.isLoading = false;
      this.cdr.detectChanges();
    };
    console.log('Starting to read file as data URL...');
    reader.readAsDataURL(this.imageFile);
  }

  private resetTransform() {
    console.log('resetTransform called with image:', {
      width: this.image.width,
      height: this.image.height,
      complete: this.image.complete
    });
    
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Set canvas size for both canvases
    const imageCanvas = this.imageCanvas.nativeElement;
    const overlayCanvas = this.overlayCanvas.nativeElement;
    const maxWidth = Math.min(600, window.innerWidth - 100);
    const maxHeight = Math.min(400, window.innerHeight - 200);
    
    const aspectRatio = this.image.width / this.image.height;
    
    console.log('Canvas sizing:', { maxWidth, maxHeight, aspectRatio });
    
    if (aspectRatio > maxWidth / maxHeight) {
      imageCanvas.width = overlayCanvas.width = maxWidth;
      imageCanvas.height = overlayCanvas.height = maxWidth / aspectRatio;
    } else {
      imageCanvas.height = overlayCanvas.height = maxHeight;
      imageCanvas.width = overlayCanvas.width = maxHeight * aspectRatio;
    }
    
    // Update display dimensions for responsive CSS
    this.canvasDisplayWidth = imageCanvas.width;
    this.canvasDisplayHeight = imageCanvas.height;
    
    console.log('Canvas final dimensions:', {
      width: imageCanvas.width,
      height: imageCanvas.height,
      displayWidth: this.canvasDisplayWidth,
      displayHeight: this.canvasDisplayHeight
    });
  }

  updatePreview() {
    console.log('updatePreview called:', {
      hasImageCtx: !!this.imageCtx,
      hasOverlayCtx: !!this.overlayCtx,
      imageComplete: this.image.complete,
      imageWidth: this.image.width,
      imageHeight: this.image.height,
      scale: this.scale,
      offsetX: this.offsetX,
      offsetY: this.offsetY
    });
    
    if (!this.imageCtx || !this.overlayCtx || !this.image.complete) {
      console.log('updatePreview early return - missing context or image not complete');
      return;
    }

    const imageCanvas = this.imageCanvas.nativeElement;
    const overlayCanvas = this.overlayCanvas.nativeElement;
    
    console.log('Canvas dimensions:', {
      imageCanvas: { width: imageCanvas.width, height: imageCanvas.height },
      overlayCanvas: { width: overlayCanvas.width, height: overlayCanvas.height }
    });
    
    // Clear both canvases
    this.imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    this.overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Draw image with current transform on image canvas
    this.imageCtx.save();
    this.imageCtx.translate(imageCanvas.width / 2 + this.offsetX, imageCanvas.height / 2 + this.offsetY);
    this.imageCtx.scale(this.scale, this.scale);
    
    console.log('Drawing image at:', {
      x: -this.image.width / 2,
      y: -this.image.height / 2,
      width: this.image.width,
      height: this.image.height
    });
    
    this.imageCtx.drawImage(
      this.image,
      -this.image.width / 2,
      -this.image.height / 2
    );
    this.imageCtx.restore();
    
    // Draw crop overlay on overlay canvas
    this.drawCropOverlay();
    
    console.log('updatePreview completed');
  }

  private drawCropOverlay() {
    const overlayCanvas = this.overlayCanvas.nativeElement;
    const ctx = this.overlayCtx;
    
    // Calculate crop dimensions
    let cropWidth, cropHeight;
    const minSize = Math.min(overlayCanvas.width, overlayCanvas.height) * 0.8;
    
    switch (this.cropSize) {
      case 'square':
        cropWidth = cropHeight = minSize;
        break;
      case 'wide':
        cropWidth = minSize;
        cropHeight = minSize * 9 / 16;
        break;
      case 'portrait':
        cropWidth = minSize * 4 / 5;
        cropHeight = minSize;
        break;
      default:
        cropWidth = overlayCanvas.width * 0.8;
        cropHeight = overlayCanvas.height * 0.8;
    }
    
    const cropX = (overlayCanvas.width - cropWidth) / 2;
    const cropY = (overlayCanvas.height - cropHeight) / 2;
    
    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Clear crop area
    ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
    
    // Draw crop frame
    ctx.strokeStyle = '#ea580c'; // Orange-600
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.5)'; // Orange-600 with opacity
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 1; i < 3; i++) {
      const x = cropX + (cropWidth * i / 3);
      ctx.beginPath();
      ctx.moveTo(x, cropY);
      ctx.lineTo(x, cropY + cropHeight);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 1; i < 3; i++) {
      const y = cropY + (cropHeight * i / 3);
      ctx.beginPath();
      ctx.moveTo(cropX, y);
      ctx.lineTo(cropX + cropWidth, y);
      ctx.stroke();
    }
  }

  // Mouse event handlers
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;
    
    this.offsetX += deltaX;
    this.offsetY += deltaY;
    
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    
    this.updatePreview();
  }

  endDrag() {
    this.isDragging = false;
  }

  // Touch event handlers
  startTouch(event: TouchEvent) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.isDragging = true;
      this.lastX = touch.clientX;
      this.lastY = touch.clientY;
    }
    event.preventDefault();
  }

  onTouch(event: TouchEvent) {
    if (!this.isDragging || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.lastX;
    const deltaY = touch.clientY - this.lastY;
    
    this.offsetX += deltaX;
    this.offsetY += deltaY;
    
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
    
    this.updatePreview();
    event.preventDefault();
  }

  endTouch() {
    this.isDragging = false;
  }

  setCropSize(size: string) {
    this.cropSize = size;
    this.updatePreview();
  }

  crop() {
    if (!this.imageCtx || !this.image.complete || this.isProcessing) return;

    this.isProcessing = true;
    
    try {
      const imageCanvas = this.imageCanvas.nativeElement;
      
      // Calculate crop dimensions (same as in drawCropOverlay)
      let cropWidth, cropHeight;
      const minSize = Math.min(imageCanvas.width, imageCanvas.height) * 0.8;
      
      switch (this.cropSize) {
        case 'square':
          cropWidth = cropHeight = minSize;
          break;
        case 'wide':
          cropWidth = minSize;
          cropHeight = minSize * 9 / 16;
          break;
        case 'portrait':
          cropWidth = minSize * 4 / 5;
          cropHeight = minSize;
          break;
        default:
          cropWidth = imageCanvas.width * 0.8;
          cropHeight = imageCanvas.height * 0.8;
      }
      
      const cropX = (imageCanvas.width - cropWidth) / 2;
      const cropY = (imageCanvas.height - cropHeight) / 2;
      
      // Create new canvas for cropped image
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropWidth;
      cropCanvas.height = cropHeight;
      const cropCtx = cropCanvas.getContext('2d')!;
      
      // Calculate the source coordinates from the original image
      // We need to reverse the transformations to get the source coordinates
      const centerX = imageCanvas.width / 2;
      const centerY = imageCanvas.height / 2;
      
      // Calculate the area of the original image that corresponds to the crop area
      const sourceX = (cropX - centerX - this.offsetX) / this.scale + this.image.width / 2;
      const sourceY = (cropY - centerY - this.offsetY) / this.scale + this.image.height / 2;
      const sourceWidth = cropWidth / this.scale;
      const sourceHeight = cropHeight / this.scale;
      
      // Clamp source coordinates to image bounds
      const clampedSourceX = Math.max(0, Math.min(this.image.width - sourceWidth, sourceX));
      const clampedSourceY = Math.max(0, Math.min(this.image.height - sourceHeight, sourceY));
      const clampedSourceWidth = Math.min(sourceWidth, this.image.width - clampedSourceX);
      const clampedSourceHeight = Math.min(sourceHeight, this.image.height - clampedSourceY);
      
      // Draw the cropped portion from the original image
      cropCtx.drawImage(
        this.image,
        clampedSourceX, clampedSourceY, clampedSourceWidth, clampedSourceHeight,
        0, 0, cropWidth, cropHeight
      );
      
      // Convert to blob and create file
      cropCanvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], this.imageFile!.name, {
            type: this.imageFile!.type
          });
          this.imageCropped.emit(croppedFile);
        }
        this.isProcessing = false;
      }, this.imageFile!.type || 'image/jpeg');
    } catch (error) {
      console.error('Error during crop operation:', error);
      this.isProcessing = false;
    }
  }

  // UI Helper Methods
  getCropSizeButtonClass(size: string): string {
    const baseClass = 'crop-size-button';
    return this.cropSize === size 
      ? `${baseClass} active bg-orange-500 text-white border-orange-500`
      : `${baseClass} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`;
  }

  adjustZoom(delta: number): void {
    this.scale = Math.max(0.1, Math.min(3, this.scale + delta));
    this.updatePreview();
  }

  resetPosition(): void {
    this.offsetX = 0;
    this.offsetY = 0;
    this.updatePreview();
  }

  centerImage(): void {
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.updatePreview();
  }

  fitToFrame(): void {
    if (!this.image.complete) return;
    
    const imageCanvas = this.imageCanvas.nativeElement;
    const imageAspect = this.image.width / this.image.height;
    const canvasAspect = imageCanvas.width / imageCanvas.height;
    
    if (imageAspect > canvasAspect) {
      this.scale = imageCanvas.width / this.image.width;
    } else {
      this.scale = imageCanvas.height / this.image.height;
    }
    
    this.offsetX = 0;
    this.offsetY = 0;
    this.updatePreview();
  }

  cancel() {
    this.cancelled.emit();
  }
}
