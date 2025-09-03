import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  
  // Computed signals for reactive cart state
  items = this.cartItems.asReadonly();
  totalItems = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
  totalPrice = computed(() => 
    this.cartItems().reduce((total, item) => {
      const price = item.product.discount > 0 
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0)
  );

  constructor() {
    // Load cart from localStorage on service initialization
    this.loadCartFromStorage();
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingItemIndex >= 0) {
      // Check if adding more quantity would exceed stock
      const currentQuantityInCart = currentItems[existingItemIndex].quantity;
      const newTotalQuantity = currentQuantityInCart + quantity;
      
      if (newTotalQuantity > product.quantity) {
        // Don't exceed available stock
        const maxAddable = product.quantity - currentQuantityInCart;
        if (maxAddable > 0) {
          // Update to maximum available quantity
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: product.quantity
          };
          this.cartItems.set(updatedItems);
          throw new Error(`Only ${maxAddable} more item(s) can be added. Cart updated to maximum available quantity (${product.quantity}).`);
        } else {
          throw new Error(`This item is already at maximum available quantity (${product.quantity}) in your cart.`);
        }
      } else {
        // Safe to add the requested quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newTotalQuantity
        };
        this.cartItems.set(updatedItems);
      }
    } else {
      // Check if requested quantity doesn't exceed stock for new item
      if (quantity > product.quantity) {
        throw new Error(`Only ${product.quantity} item(s) available in stock.`);
      }
      // Add new item to cart
      this.cartItems.set([...currentItems, { product, quantity }]);
    }

    this.saveCartToStorage();
  }

  removeFromCart(productId: string): void {
    const updatedItems = this.cartItems().filter(item => item.product.id !== productId);
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }

  getItemQuantity(productId: string): number {
    const item = this.cartItems().find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  // Check how many more items can be added to cart for a product
  getAvailableToAdd(product: Product): number {
    const currentInCart = this.getItemQuantity(product.id);
    return Math.max(0, product.quantity - currentInCart);
  }

  // Check if product is at maximum quantity in cart
  isAtMaxQuantity(product: Product): boolean {
    return this.getItemQuantity(product.id) >= product.quantity;
  }

  private saveCartToStorage(): void {
    try {
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems.set(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.cartItems.set([]);
    }
  }
}
