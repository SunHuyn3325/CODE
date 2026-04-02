import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './models/product';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ProductApiService {

  private apiURL = `${environment.apiBase}/products`;
  private uploadURL = `${environment.apiBase}/upload-image`;
  private currentProduct = new BehaviorSubject<any>(null);
  currentProduct$ = this.currentProduct.asObservable();

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiURL);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiURL}/${id}`)
  }

  getProductsByCategory(category: string): Observable<Product[]> {
  const url = `${environment.apiBase}/products?product_dept=${category}`;
  return this.http.get<Product[]>(url);
  }
  addProduct(data: any) {
    return this.http.post(this.apiURL, data);
  }
  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ fileName: string; imageUrl: string }>(this.uploadURL, formData);
  }
  deleteProduct(id: string) {
    return this.http.delete(this.apiURL + "/" + id);
  }
  setCurrentProduct(product: any) {
    this.currentProduct.next(product);
  }
  getCurrentProduct() {
    return this.currentProduct$;
  }
  updateProduct(id: string, data: any) {
    return this.http.put<any>(`${this.apiURL}/${id}`, data);
  }
  placeOrder(orderData: any) {
    return this.http.post(this.apiURL, orderData);
  }


}