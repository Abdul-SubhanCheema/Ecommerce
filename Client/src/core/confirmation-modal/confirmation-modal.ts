import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal" [class.modal-open]="isOpen">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{{ title }}</h3>
        <p class="py-4">{{ message }}</p>
        <div class="modal-action">
          <button class="btn btn-outline" (click)="onCancel()">Cancel</button>
          <button class="btn btn-error" (click)="onConfirm()">{{ confirmButtonText }}</button>
        </div>
      </div>
      <div class="modal-backdrop" (click)="onCancel()"></div>
    </div>
  `
})
export class ConfirmationModal {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmButtonText = 'Confirm';
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}