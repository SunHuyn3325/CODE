import { Component } from '@angular/core';
import { UserApiService } from '../user-api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddressService } from '../address.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})

export class Account {

  user:any = {};
  address:any = {};
  editUser = false;
  editAddress = false;
  currentTab = 'profile';

  constructor(
    private userApi: UserApiService,
    private addressService: AddressService,
    private router: Router
  ){}

  ngOnInit(){
    this.currentTab = 'profile'
    this.userApi.currentUser$.subscribe((user:any)=>{

    if(!user){
      this.router.navigate(['/login']);
      return;
    }

    this.userApi.getUser(user._id).subscribe((fullUser:any)=>{
      this.user = fullUser;

      this.loadAddress();
    });

  });
}

  saveUser(){

    if(!this.user?._id) return;

    this.userApi.updateUser(this.user._id,this.user)
    .subscribe((res:any)=>{
      alert("Cập nhật thành công");
      this.editUser=false;
    });
  }

  logout(){
    this.userApi.logout();
    this.router.navigate(['/login']);
  }
  loadAddress(){
    if(!this.user?._id) return;
    this.addressService.getAddressByUser(this.user._id)
    .subscribe((res:any)=>{
      if(res){
        this.address = res;
      }
    });
  }
  saveAddress(){

    if(!this.user?._id) return;

    this.address.userId = this.user._id;

    // nếu đã có address thì update
    if(this.address?._id){

      this.addressService.updateAddress(this.address._id,this.address)
      .subscribe(()=>{
        alert("Cập nhật địa chỉ thành công");
        this.editAddress = false;
      });

    }
    else{

      this.addressService.createAddress(this.address)
      .subscribe((res:any)=>{
        this.address = res;
        this.editAddress = false;
      });

    }

  }
}