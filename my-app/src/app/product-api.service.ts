import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './models/product';

@Injectable({
  providedIn: 'root'
})

export class ProductApiService {

  private apiURL = "http://localhost:3000/products";

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiURL)
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiURL}/${id}`)
  }

  getProductsByCategory(category: string): Observable<Product[]> {
  const url = `http://localhost:3000/products?product_dept=${category}`;
  return this.http.get<Product[]>(url);
  }

}