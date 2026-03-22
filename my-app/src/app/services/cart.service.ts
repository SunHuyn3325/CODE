import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface CartItem {
  _id?: string;
  userId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderRequest {
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

interface OrderRequestV2 extends OrderRequest {
  paymentMethod?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();
  
  // BehaviorSubject cho số lượng sản phẩm trong giỏ
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();
  
  private currentUserId = '1'; // In production, get from auth service

  constructor(private http: HttpClient) {
    this.loadCartFromAPI();
  }

  // Load cart from backend
  loadCartFromAPI(): void {
    this.getUserCart().subscribe({
      next: (items) => {
        this.cartSubject.next(items);
        this.updateCartCount(items);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.cartSubject.next([]);
        this.cartCountSubject.next(0);
      }
    });
  }

  // Update cart count
  private updateCartCount(items: CartItem[]): void {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  // Get cart items for current user
  getUserCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/cart/user/${this.currentUserId}`);
  }

  // Add item to cart
  addToCart(item: { name: string; price: number; image: string; quantity?: number }): Observable<CartItem> {
    const cartItem = {
      userId: this.currentUserId,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image
    };

    return this.http.post<CartItem>(`${this.apiUrl}/cart`, cartItem).pipe(
      tap(() => this.loadCartFromAPI()) // Reload cart after adding
    );
  }

  // Update cart item quantity
  updateQuantity(itemId: string, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/cart/${itemId}`, { quantity }).pipe(
      tap(() => this.loadCartFromAPI()) // Reload cart after updating
    );
  }

  // Remove item from cart
  removeFromCart(itemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${itemId}`).pipe(
      tap(() => this.loadCartFromAPI()) // Reload cart after removing
    );
  }

  // Clear entire cart
  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/user/${this.currentUserId}`).pipe(
      tap(() => {
        this.cartSubject.next([]);
        this.cartCountSubject.next(0);
      })
    );
  }

  // Create order from cart
  createOrderFromCart(customerInfo: { name: string; email: string; phone: string; address: string, paymentMethod?: string }, paymentMethod?: string): Observable<any> {
    const orderRequest: OrderRequestV2 = {
      userId: this.currentUserId,
      customerInfo: customerInfo,
      paymentMethod: paymentMethod
    };

    return this.http.post(`${this.apiUrl}/order/from-cart`, orderRequest).pipe(
      tap(() => {
        this.cartSubject.next([]);
        this.cartCountSubject.next(0);
      })
    );
  }

  // Get cart count
  getCartCount(): Observable<number> {
    return this.cartCount$;
  }

  // Get cart total
  getCartTotal(): Observable<number> {
    return this.cart$.pipe(
      map(items => items.reduce((total, item) => total + (item.price * item.quantity), 0))
    );
  }
}