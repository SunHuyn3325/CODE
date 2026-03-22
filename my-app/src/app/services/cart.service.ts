import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  addToCart(cartItem: any): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const customerID = user.CustomerID || user._id;
      if (!customerID) return;

      this.http.post(`${this.apiUrl}/cart/add`, {
        customerID,
        item: cartItem
      }).subscribe({
        error: (err: any) => console.error('Error adding to cart:', err)
      });
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  async checkStockBeforeAdd(cartItem: any, quantity: number, stock: number | undefined, isBuyNow: boolean): Promise<boolean> {
    if (stock !== undefined && stock !== null && quantity > stock) {
      return false;
    }
    return true;
  }
}
