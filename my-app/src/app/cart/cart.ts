import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationApiService } from '../location-api.service';
import { OrderApiService } from '../order-api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit {

  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];

  selectedProvince: any;
  selectedDistrict: any;
  selectedWard: any;

  form = {
    name: '',
    phone: '',
    email: '',
    address: ''
  };

  cart: any[] = [];
  total = 0;

  constructor(
    private locationService: LocationApiService,
    private orderService: OrderApiService
  ) {}

  ngOnInit() {
    this.locationService.getProvinces().subscribe(res => {
      this.provinces = res;
    });

    this.loadCart();
  }

  loadCart() {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cart = cartData;

    this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.cart.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  // ✅ FIX BUTTON + -
  increase(item: any) {
    item.quantity++;
    this.calculateTotal();
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  decrease(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.calculateTotal();
      localStorage.setItem('cart', JSON.stringify(this.cart));
    }
  }

  // ✅ FIX IMAGE
  resolveAssetImage(image?: string | null) {
    if (!image) return 'assets/default.png';

    if (image.startsWith('http') || image.startsWith('/assets')) {
      return image;
    }

    return 'assets/' + image;
  }

  onProvinceChange(event: any) {
    this.selectedProvince = event.target.value;

    this.locationService.getDistricts(this.selectedProvince)
      .subscribe(res => this.districts = res);
  }

  onDistrictChange(event: any) {
    this.selectedDistrict = event.target.value;

    this.locationService.getWards(this.selectedDistrict)
      .subscribe(res => this.wards = res);
  }

  onWardChange(event: any) {
    this.selectedWard = event.target.value;
  }

  submitOrder() {
    if (!this.form.name || !this.form.phone || !this.selectedWard) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const order = {
      customer: this.form,
      address: {
        province: this.selectedProvince,
        district: this.selectedDistrict,
        ward: this.selectedWard
      },
      cart: this.cart,
      total: this.total,
      isGuest: true
    };

    this.orderService.createOrder(order).subscribe({
      next: () => {
        alert('Đặt hàng thành công');
        localStorage.removeItem('cart');
        this.cart = [];
        this.total = 0;
      },
      error: () => alert('Lỗi đặt hàng')
    });
  }
}