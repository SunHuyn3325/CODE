import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderApiService {
  private apiUrl = `${environment.apiBase}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createOrder(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelOrder(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, {});
  }

  shipOrder(id: string, trackingCode: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/ship`, { trackingCode });
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateShipping(id: string, shippingData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/shipping`, shippingData);
  }
}
