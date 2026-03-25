import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewApiService {
  private apiUrl = 'http://localhost:3000/reviews';

  constructor(private http: HttpClient) {}

  getReviews(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getReviewsByUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getReviewsByOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/order/${orderId}`);
  }

  getReviewsByProduct(productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/${productId}`);
  }

  checkReview(userId: string, orderId: string, productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/check?userId=${encodeURIComponent(userId)}&orderId=${encodeURIComponent(orderId)}&productId=${encodeURIComponent(productId)}`);
  }

  createReview(reviewData: any): Observable<any> {
    return this.http.post(this.apiUrl, reviewData);
  }

  updateReview(reviewId: string, reviewData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reviewId}`, reviewData);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }
}
