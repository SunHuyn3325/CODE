import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationApiService } from '../location-api.service';
import { ProductApiService } from '../product-api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  allData: any[] = [];

  cart: any[] = [];
  total: number = 0;

  form = {
    name: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    ward: ''
  };

  constructor(
    private locationService: LocationApiService,
    private productService: ProductApiService
  ) {}

  ngOnInit(): void {

    // 👉 load location
    this.locationService.getAllLocations().subscribe(data => {
      this.allData = data;
      this.provinces = data;
    });

    // 👉 load cart từ localStorage (QUAN TRỌNG)
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // 👉 tính tổng tiền
    this.total = this.cart.reduce((sum: number, item: any) => {
      return sum + item.price * (item.quantity || 1);
    }, 0);
  }

  onProvinceChange(event: any) {
    const code = +event.target.value;
    const province = this.allData.find(p => p.code === code);

    this.districts = province?.districts || [];
    this.wards = [];
  }

  onDistrictChange(event: any) {
    const code = +event.target.value;

    for (let p of this.allData) {
      const district = p.districts.find((d: any) => d.code === code);
      if (district) {
        this.wards = district.wards;
        break;
      }
    }
  }

  // 👉 nút đặt hàng
  placeOrder() {
    const orderData = {
      user: this.form,
      items: this.cart,
      total: this.total
    };

    this.productService.placeOrder(orderData).subscribe(() => {
      alert('Đặt hàng thành công!');

      // clear cart
      localStorage.removeItem('cart');

      // reset UI
      this.cart = [];
      this.total = 0;
    });
  }

}
