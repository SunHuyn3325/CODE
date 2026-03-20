import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductApiService } from '../product-api.service';
import { Product } from '../models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CartApiService } from '../cart-api.service';
import { WishlistApiService } from '../wishlist-api.service';

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
  isWishlisted = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductApiService,
    private cdr: ChangeDetectorRef,
    private cartService: CartApiService,
    private router: Router,
    private wishlistService: WishlistApiService,
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
      this.syncWishlistState();

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
  addToCart() {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng và nhận voucher ưu đãi.');
      this.router.navigate(['/login']);
      return;
    }

    const userId = JSON.parse(userRaw)._id;

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

  toggleWishlist() {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      alert('Vui lòng đăng nhập để thêm sản phẩm yêu thích.');
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userRaw);
    const userId = user?._id;
    if (!userId || !this.product?._id) return;

    const currentWishlist = this.wishlistService.getWishlistByUser(userId);
    const existing = currentWishlist.find((item: any) => item.productId === this.product._id);

    if (existing) {
      this.wishlistService.removeFromWishlist(existing._id);
      this.isWishlisted = false;
      return;
    }

    this.wishlistService.addToWishlist({
      userId,
      productId: this.product._id,
      productName: this.product.product_name,
      productPrice: this.product.unit_price,
      productSku: this.product._id,
      productImage: this.getImageSrc(this.product.images?.[0]),
    });

    this.isWishlisted = true;
  }

  private syncWishlistState() {
    const userRaw = localStorage.getItem('user');
    if (!userRaw || !this.product?._id) {
      this.isWishlisted = false;
      return;
    }

    const user = JSON.parse(userRaw);
    const userId = user?._id;
    if (!userId) {
      this.isWishlisted = false;
      return;
    }

    const wishlist = this.wishlistService.getWishlistByUser(userId);
    this.isWishlisted = wishlist.some((item: any) => item.productId === this.product._id);
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

  // trả đúng đường dẫn ảnh: base64 / http dùng trực tiếp, còn lại thêm /assets/
  getImageSrc(img: string | undefined): string {
    if (!img) return '/assets/placeholder.jpg';
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    if (img.startsWith('/')) return img;
    return '/assets/' + img;
  }

}