import { Injectable } from '@angular/core';

export interface ToastOptions {
  duration?: number;
  closable?: boolean;
  icon?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastCounter = 0;

  constructor() {
    this.createToastContainer();
    this.injectToastStyles();
  }

  private createToastContainer() {
    if (!document.getElementById("modern-toast-container")) {
      const container = document.createElement("div");
      container.id = "modern-toast-container";
      container.className = "modern-toast-container";
      document.body.appendChild(container);
    }
  }

  private injectToastStyles() {
    if (!document.getElementById("modern-toast-styles")) {
      const styles = document.createElement("style");
      styles.id = "modern-toast-styles";
      styles.textContent = `
        .modern-toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          pointer-events: none;
          max-width: 400px;
        }

        .modern-toast {
          pointer-events: all;
          margin-bottom: 12px;
          min-width: 300px;
          max-width: 400px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transform: translateX(100%);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          backdrop-filter: blur(10px);
        }

        .modern-toast.show {
          transform: translateX(0);
          opacity: 1;
        }

        .modern-toast.hide {
          transform: translateX(100%);
          opacity: 0;
        }

        .modern-toast-header {
          display: flex;
          align-items: center;
          padding: 16px 20px 12px;
          gap: 12px;
        }

        .modern-toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .modern-toast-content {
          flex: 1;
          min-width: 0;
        }

        .modern-toast-title {
          font-weight: 600;
          font-size: 14px;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .modern-toast-message {
          font-size: 13px;
          line-height: 1.4;
          margin: 0;
          opacity: 0.85;
          word-wrap: break-word;
        }

        .modern-toast-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
          padding: 4px;
          border-radius: 4px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modern-toast-close:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.05);
        }

        .modern-toast-progress {
          height: 3px;
          background: rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .modern-toast-progress-bar {
          height: 100%;
          background: currentColor;
          width: 100%;
          transform: translateX(-100%);
          transition: transform linear;
        }

        /* Success Toast */
        .modern-toast.success {
          border-left: 4px solid #10b981;
        }
        .modern-toast.success .modern-toast-icon {
          background: #ecfdf5;
          color: #10b981;
        }
        .modern-toast.success .modern-toast-title {
          color: #065f46;
        }
        .modern-toast.success .modern-toast-progress-bar {
          background: #10b981;
        }

        /* Error Toast */
        .modern-toast.error {
          border-left: 4px solid #ef4444;
        }
        .modern-toast.error .modern-toast-icon {
          background: #fef2f2;
          color: #ef4444;
        }
        .modern-toast.error .modern-toast-title {
          color: #991b1b;
        }
        .modern-toast.error .modern-toast-progress-bar {
          background: #ef4444;
        }

        /* Warning Toast */
        .modern-toast.warning {
          border-left: 4px solid #f59e0b;
        }
        .modern-toast.warning .modern-toast-icon {
          background: #fffbeb;
          color: #f59e0b;
        }
        .modern-toast.warning .modern-toast-title {
          color: #92400e;
        }
        .modern-toast.warning .modern-toast-progress-bar {
          background: #f59e0b;
        }

        /* Info Toast */
        .modern-toast.info {
          border-left: 4px solid #3b82f6;
        }
        .modern-toast.info .modern-toast-icon {
          background: #eff6ff;
          color: #3b82f6;
        }
        .modern-toast.info .modern-toast-title {
          color: #1e40af;
        }
        .modern-toast.info .modern-toast-progress-bar {
          background: #3b82f6;
        }

        @media (max-width: 640px) {
          .modern-toast-container {
            left: 20px;
            right: 20px;
            top: 20px;
            max-width: none;
          }
          .modern-toast {
            min-width: auto;
            max-width: none;
          }
        }
      `;
      document.head.appendChild(styles);
    }
  }

  private createToastElement(type: 'success' | 'error' | 'warning' | 'info', message: string, options: ToastOptions = {}) {
    const {
      duration = 4000,
      closable = true,
      icon
    } = options;

    const toastContainer = document.getElementById("modern-toast-container");
    if (!toastContainer) return;

    const toastId = `toast-${++this.toastCounter}`;
    const toast = document.createElement("div");
    toast.id = toastId;
    toast.className = `modern-toast ${type}`;

    const typeConfig = {
      success: { icon: icon || '✓', title: 'Success' },
      error: { icon: icon || '✕', title: 'Error' },
      warning: { icon: icon || '⚠', title: 'Warning' },
      info: { icon: icon || 'ℹ', title: 'Info' }
    };

    const config = typeConfig[type];

    toast.innerHTML = `
      <div class="modern-toast-header">
        <div class="modern-toast-icon">${config.icon}</div>
        <div class="modern-toast-content">
          <div class="modern-toast-title">${config.title}</div>
          <div class="modern-toast-message">${message}</div>
        </div>
        ${closable ? '<button class="modern-toast-close" aria-label="Close">×</button>' : ''}
      </div>
      ${duration > 0 ? '<div class="modern-toast-progress"><div class="modern-toast-progress-bar"></div></div>' : ''}
    `;

    // Add close button functionality
    if (closable) {
      const closeBtn = toast.querySelector('.modern-toast-close');
      closeBtn?.addEventListener('click', () => this.removeToast(toastId));
    }

    // Add click to dismiss (except on close button)
    toast.addEventListener('click', (e) => {
      if (!(e.target as Element).closest('.modern-toast-close')) {
        this.removeToast(toastId);
      }
    });

    toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove
    if (duration > 0) {
      const progressBar = toast.querySelector('.modern-toast-progress-bar') as HTMLElement;
      if (progressBar) {
        progressBar.style.transform = 'translateX(0)';
        progressBar.style.transitionDuration = `${duration}ms`;
      }

      setTimeout(() => {
        this.removeToast(toastId);
      }, duration);
    }
  }

  private removeToast(toastId: string) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  success(message: string, options?: ToastOptions) {
    this.createToastElement('success', message, options);
  }

  error(message: string, options?: ToastOptions) {
    this.createToastElement('error', message, options);
  }

  warning(message: string, options?: ToastOptions) {
    this.createToastElement('warning', message, options);
  }

  info(message: string, options?: ToastOptions) {
    this.createToastElement('info', message, options);
  }

  // Convenience methods for common use cases
  cartAdded(productName: string) {
    this.success(`${productName} added to cart!`, { icon: '🛒' });
  }

  cartRemoved(productName: string) {
    this.info(`${productName} removed from cart`, { icon: '🗑️' });
  }

  outOfStock(productName: string) {
    this.warning(`${productName} is out of stock`, { icon: '📦' });
  }

  networkError() {
    this.error('Network error. Please check your connection.', { icon: '🌐', duration: 5000 });
  }

  // Clear all toasts
  clearAll() {
    const container = document.getElementById("modern-toast-container");
    if (container) {
      container.innerHTML = '';
    }
  }
}
