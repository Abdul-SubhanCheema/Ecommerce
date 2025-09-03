import { Component, inject } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cartdetails',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cartdetails.html',
  styleUrl: './cartdetails.css'
})
export class Cartdetails {
  cartService = inject(CartService);

  // Update quantity of an item in cart
  updateQuantity(productId: string, quantity: number): void {
    if (quantity > 0) {
      // Find the product to check stock
      const cartItem = this.cartService.items().find(item => item.product.id === productId);
      if (cartItem && quantity > cartItem.product.quantity) {
        alert(`Sorry, only ${cartItem.product.quantity} items available in stock.`);
        return;
      }
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  // Remove item from cart
  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  // Clear entire cart
  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
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
      alert('Proceeding to checkout...');
      // TODO: Navigate to checkout page
    } else {
      alert('Your cart is empty!');
    }
  }
}
