import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReturnApiService {
  private apiUrl = 'http://localhost:3000/returns';

  constructor(private http: HttpClient) {}

  getReturns(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getReturnsByUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getReturnsByOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/order/${orderId}`);
  }

  createReturn(returnData: any): Observable<any> {
    return this.http.post(this.apiUrl, returnData);
  }

  updateReturnStatus(returnId: string, status: string, adminNote?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${returnId}/status`, { status, adminNote });
  }

  deleteReturn(returnId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${returnId}`);
  }
}
