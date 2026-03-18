import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  api = "http://localhost:3000/addresses";
  constructor(private http: HttpClient) {}
  getAddressByUser(userId:any){
    return this.http.get(this.api + "/" + userId);
  }
  createAddress(data:any){
    return this.http.post(this.api, data);
  }
  updateAddress(id:any,data:any){
    return this.http.put(this.api + "/" + id, data);
  }
  deleteAddress(id:any){
    return this.http.delete(this.api + "/" + id);
  }
}
