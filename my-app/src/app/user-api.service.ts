import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {

  api = "http://localhost:3000/users";

  private currentUser = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {}

  // đăng ký
  register(data:any){
    return this.http.post(this.api, data);
  }

  // login
  login(data:any){
    return this.http.post(this.api + "/login", data);
  }

  // lấy user
  getUser(id:string){
  return this.http.get(this.api + "/" + id);
}
  updateUser(id:any,data:any){
    return this.http.put(this.api+"/"+id,data);
  } 
  setUser(user:any){
    this.currentUser.next(user);
  }
  getCurrentUser(){
    return this.http.get(this.api + "/me");
  }
  loadCurrentUser(){
    this.getCurrentUser().subscribe({
      next: (user:any)=>{
        this.currentUser.next(user);
      },
      error: ()=>{
        this.currentUser.next(null);
      }
    });
  }
  addUser(data: any) {
    return this.http.post(this.api, data);
  }

  
  getUsers() {
    return this.http.get<any[]>(this.api);
  }
  deleteUser(id: string) {
    return this.http.delete<any>(this.api + "/" + id);
  }
  // logout
  logout(){
    this.currentUser.next(null);
  }
}