import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { UserApiService } from '../../user-api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  pageTitle: string = 'Trang chủ';
  profileName: string = 'Admin';

  constructor(private router: Router, private userApi: UserApiService) {}

  confirmLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      this.logout();
    }
  }

  logout() {
    this.userApi.logout(); // xóa user khỏi localStorage và service
    this.router.navigate(['/login']);
  }
}
