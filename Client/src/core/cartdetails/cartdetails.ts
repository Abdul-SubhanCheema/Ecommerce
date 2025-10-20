import { Component, inject } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-cartdetails',
  imports: [CommonModule, RouterLink, FormsModule, ConfirmationModal],
  templateUrl: './cartdetails.html',
  styleUrl: './cartdetails.css'
})
export class Cartdetails {
  cartService = inject(CartService);
  private toastService = inject(ToastService);
  
  // Modal state
  isConfirmModalOpen = false;

  // Update quantity of an item in cart
  updateQuantity(productId: string, quantity: number): void {
    if (quantity > 0) {
      // Find the product to check stock
      const cartItem = this.cartService.items().find(item => item.product.id === productId);
      if (cartItem && quantity > cartItem.product.quantity) {
        this.toastService.error(`Sorry, only ${cartItem.product.quantity} items available in stock.`, { icon: '📦' });
        return;
      }
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  // Remove item from cart
  removeItem(productId: string): void {
    // Get the product name before removing for the toast message
    const cartItem = this.cartService.items().find(item => item.product.id === productId);
    const productName = cartItem?.product.productName || 'Item';
    
    this.cartService.removeFromCart(productId);
    this.toastService.cartRemoved(productName);
  }

  // Clear entire cart
  clearCart(): void {
    this.isConfirmModalOpen = true;
  }
  
  // Confirm clear cart
  onConfirmClearCart(): void {
    this.cartService.clearCart();
    this.toastService.success('Cart cleared successfully!', { icon: '🧹', duration: 3000 });
    this.isConfirmModalOpen = false;
  }
  
  // Cancel clear cart
  onCancelClearCart(): void {
    this.isConfirmModalOpen = false;
    this.toastService.info('Cart clear cancelled');
  }

  // Calculate discounted price
  getDiscountedPrice(price: number, discount: number): number {
    return price * (1 - discount / 100);
  }

  // Check if product has discount
  hasDiscount(discount: number): boolean {
    return discount > 0;
  }

  // Calculate savings amount
  getSavingsAmount(price: number, discount: number): number {
    return price * (discount / 100);
  }

  // Proceed to checkout
  proceedToCheckout(): void {
    if (this.cartService.totalItems() > 0) {
      this.toastService.info('Proceeding to checkout...', { icon: '💳' });
      // TODO: Navigate to checkout page
    } else {
      this.toastService.warning('Your cart is empty!', { icon: '🛒' });
    }
  }
}
