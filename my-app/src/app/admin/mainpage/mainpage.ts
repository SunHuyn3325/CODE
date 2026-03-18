import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mainpage.html',
  styleUrl: './mainpage.css',
})
export class Mainpage {
  profileName: string = '';

  recentActivities = [
    { module: 'Sản phẩm / Áo dài', action: 'Thêm sản phẩm mới' },
    { module: 'Đơn hàng / Order', action: 'Cập nhật trạng thái' },
    { module: 'Tài khoản / User', action: 'Tạo tài khoản admin' },
    { module: 'Danh mục / Category', action: 'Chỉnh sửa danh mục' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // sau này gọi API backend ở đây
    this.profileName = 'Admin'; 
  }

  goToWebsite() {
    this.router.navigate(['/']);
  }

  changePassword() {
    this.router.navigate(['/change-password']);
  }
}
