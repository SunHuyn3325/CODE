import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserApiService } from '../../user-api.service';

interface SidebarMenuItem {
  id: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-customer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-customer.html',
  styleUrl: './sidebar-customer.css',
})
export class SidebarCustomer implements OnInit {
  @Input() notificationBadge: number = 0;

  isMobileSidebarOpen = false;
  userName = 'Khach hang';
  userEmail = '';
  userAvatar = '/assets/user.png';

  menuItems: SidebarMenuItem[] = [
    { id: 'profile', label: 'Tai khoan ca nhan', route: '/account/profile' },
    { id: 'address', label: 'So dia chi', route: '/account/address' },
    { id: 'orders', label: 'Don hang', route: '/account/orders' },
    { id: 'returns', label: 'Doi tra', route: '/account/returns' },
    { id: 'reviews', label: 'Danh gia', route: '/account/reviews' },
    { id: 'wishlist', label: 'Yeu thich', route: '/account/wishlist' },
  ];

  constructor(
    private router: Router,
    private userApi: UserApiService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.userApi.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.profileName || user.fullName || this.userName;
        this.userEmail = user.email || this.userEmail;
      }
    });
  }

  private loadUserInfo(): void {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      this.userName = user.profileName || user.fullName || user.FullName || 'Khach hang';
      this.userEmail = user.email || user.Email || '';
      this.userAvatar = user.avatar || '/assets/user.png';
    } catch {
      this.userName = 'Khach hang';
      this.userEmail = '';
      this.userAvatar = '/assets/user.png';
    }
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  onLogout(): void {
    localStorage.removeItem('user');
    this.userApi.logout();
    this.closeMobileSidebar();
    this.router.navigate(['/login']);
  }
}