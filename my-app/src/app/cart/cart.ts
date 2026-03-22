import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationApiService } from '../location-api.service';
import { OrderApiService } from '../order-api.service';
import { CartService } from '../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit, OnDestroy {

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
  loading = false;
  
  private cartSubscription?: Subscription;

  constructor(
    private locationService: LocationApiService,
    private orderService: OrderApiService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.locationService.getProvinces().subscribe(res => {
      this.provinces = res;
    });

    // Lắng nghe thay đổi giỏ hàng real-time
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.calculateTotal();
      console.log('Cart updated from API:', cart.length, 'items');
    });

    // Load giỏ hàng từ API khi khởi tạo
    this.cartService.loadCartFromAPI();
  }
  
  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  calculateTotal() {
    this.total = this.cart.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  // Sử dụng CartService API thay vì thao tác localStorage
  increase(item: any) {
    this.loading = true;
    this.cartService.updateQuantity(item._id, item.quantity + 1).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        console.error('Error increasing quantity:', err);
        this.loading = false;
        alert('Có lỗi khi cập nhật số lượng');
      }
    });
  }

  decrease(item: any) {
    if (item.quantity > 1) {
      this.loading = true;
      this.cartService.updateQuantity(item._id, item.quantity - 1).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          console.error('Error decreasing quantity:', err);
          this.loading = false;
          alert('Có lỗi khi cập nhật số lượng');
        }
      });
    }
  }
  
  removeItem(item: any) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      this.loading = true;
      this.cartService.removeFromCart(item._id).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          console.error('Error removing item:', err);
          this.loading = false;
          alert('Có lỗi khi xóa sản phẩm');
        }
      });
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

    if (this.cart.length === 0) {
      alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }

    const orderData = {
      customer: this.form,
      address: {
        province: this.selectedProvince,
        district: this.selectedDistrict,
        ward: this.selectedWard
      },
      shippingAddress: `${this.form.address}, ${this.selectedWard}, ${this.selectedDistrict}, ${this.selectedProvince}`
    };

    this.loading = true;
    
    // Chuẩn bị dữ liệu customer info cho backend
    const customerInfo = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      address: `${this.form.address}, ${this.selectedWard}, ${this.selectedDistrict}, ${this.selectedProvince}`
    };
    
    // Sử dụng CartService để tạo order từ giỏ hàng backend
    this.cartService.createOrderFromCart(customerInfo).subscribe({
      next: (response) => {
        this.loading = false;
        alert(`Đặt hàng thành công! Mã đơn hàng: ${response.orderId || response._id}`);
        
        // Reset form
        this.form = { name: '', phone: '', email: '', address: '' };
        this.selectedProvince = null;
        this.selectedDistrict = null;
        this.selectedWard = null;
        this.districts = [];
        this.wards = [];
        
        // Giỏ hàng đã tự động clear trong CartService
        console.log('Order created successfully:', response);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error creating order:', err);
        alert('Lỗi đặt hàng. Vui lòng thử lại.');
      }
    });
  }
}