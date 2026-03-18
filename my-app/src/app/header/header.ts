import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserApiService } from '../user-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  user: any = null;
  constructor(private userApi: UserApiService) {}
  onSearch() {
    console.log("Search clicked");
  }
  onCart() {
    console.log("Cart clicked");
  }
  onLogin() {
    console.log("Login clicked");
  }
  ngOnInit(){
  this.userApi.currentUser$.subscribe(user=>{
    this.user = user;
  });
  }
}
