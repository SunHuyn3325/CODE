import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductApiService } from '../product-api.service';
import { Product } from '../models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CartApiService } from '../cart-api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})

export class ProductDetail implements OnInit {

  product!: Product;
  selectedImage: string = '';
  quantity: number = 1;

  relatedProducts: Product[] = [];
  viewedProducts: Product[] = [];

  showSizeGuide = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductApiService,
    private cdr: ChangeDetectorRef,
    private cartService: CartApiService,
  ) {}

  ngOnInit() {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (id) {
        this.loadProduct(id);
      }

    });

  }

  loadProduct(id: string) {

    this.productService.getProduct(id).subscribe(data => {

      this.product = data;

      this.selectedImage = data.images?.[0] || '';

      this.loadRelatedProducts(data.product_dept, data._id);

      this.saveViewedProduct(data);
      this.loadViewedProducts();

      this.cdr.detectChanges();

    });

  }

  loadRelatedProducts(dept: string, currentId: string) {

    this.productService.getProducts().subscribe((data: any) => {

      this.relatedProducts = data
        .filter((p: any) =>
          p.product_dept === dept && p._id !== currentId
        )
        .slice(0, 4);

    });

  }

  // lưu sản phẩm đã xem
  saveViewedProduct(product: Product) {

    if (typeof localStorage === 'undefined') return;

    let viewed = JSON.parse(
      localStorage.getItem('viewedProducts') || '[]'
    );

    // xóa nếu đã tồn tại
    viewed = viewed.filter((p: any) => p._id !== product._id);

    // thêm vào đầu
    viewed.unshift(product);

    // chỉ giữ 4 sản phẩm
    viewed = viewed.slice(0, 4);

    localStorage.setItem(
      'viewedProducts',
      JSON.stringify(viewed)
    );

  }

  // load sản phẩm đã xem
  loadViewedProducts() {

    if (typeof localStorage === 'undefined') return;

    this.viewedProducts = JSON.parse(
      localStorage.getItem('viewedProducts') || '[]'
    );

  }
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
  addToCart() {
  const userId = this.getUserId();

    const item = {
      userId: userId,
      productId: this.product._id,
      name: this.product.product_name,
      price: this.product.unit_price,
      image: this.selectedImage,
      quantity: this.quantity
    };

    this.cartService.addToCart(item).subscribe(() => {
      alert('Đã thêm vào giỏ hàng');
    });
  }

  changeImage(img: string) {
    this.selectedImage = img;
  }

  increase() {
    this.quantity++;
  }

  decrease() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  openSizeGuide() {
    this.showSizeGuide = true;
  }

  closeSizeGuide() {
    this.showSizeGuide = false;
  }

}