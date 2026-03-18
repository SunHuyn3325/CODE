import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationApiService } from '../location-api.service';
import { CartApiService } from '../cart-api.service';
import { OrderApiService } from '../order-api.service';

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
    private cartService: CartApiService,
    private orderService: OrderApiService
  ) {}

  ngOnInit(): void {

    // ✅ load location
    this.locationService.getAllLocations().subscribe(data => {
      this.allData = data;
      this.provinces = data;
    });

    // ✅ load cart từ MongoDB
    const userId = this.getUserId();
    this.cartService.getCartByUser(userId).subscribe(data => {
      this.cart = data;

      this.calculateTotal();
    });
  }

  // ✅ lấy userId (user hoặc guest)
  getUserId(): string {
    const user = localStorage.getItem('user');

    if (user) {
      return JSON.parse(user)._id;
    }

    let guestId = localStorage.getItem('guestId');

    if (!guestId) {
      guestId = 'guest_' + new Date().getTime();
      localStorage.setItem('guestId', guestId);
    }

    return guestId;
  }

  // ✅ tính tổng tiền
  calculateTotal() {
    this.total = this.cart.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  // ✅ chọn tỉnh
  onProvinceChange(event: any) {
    const code = +event.target.value;
    const province = this.allData.find(p => p.code === code);

    this.districts = province?.districts || [];
    this.wards = [];
  }

  // ✅ chọn quận
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

  // ✅ đặt hàng
  placeOrder() {

    const userId = this.getUserId();

    const orderData = {
      userId: userId,
      user: this.form,
      items: this.cart,
      total: this.total,
      status: 'pending'
    };

    this.orderService.createOrder(orderData).subscribe(() => {

      alert('Đặt hàng thành công!');

      // 🔥 clear cart trong DB
      this.cartService.clearCart(userId).subscribe(() => {
        this.cart = [];
        this.total = 0;
      });

    });
  }
  increase(item: any) {
    item.quantity++;

    this.cartService.updateQuantity(item._id, item.quantity)
      .subscribe(() => {
        this.calculateTotal();
      });
  }
  decrease(item: any) {
    if (item.quantity > 1) {
      item.quantity--;

      this.cartService.updateQuantity(item._id, item.quantity)
        .subscribe(() => {
          this.calculateTotal();
        });
    }
  }

}