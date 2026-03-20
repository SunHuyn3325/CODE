import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserApiService } from '../../user-api.service';
import { Account } from '../../models/Account';

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

  user: Account | null = null;
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

    // ✅ CHỈ dùng BehaviorSubject (KHÔNG localStorage)
    this.userApi.currentUser$.subscribe((user) => {

      if (user) {
        this.user = user;

        this.userName = user.profileName || 'Khach hang';
        this.userEmail = user.email || '';
        this.userAvatar = user.avatar || '/assets/user.png';
      } else {
        // fallback khi logout
        this.userName = 'Khach hang';
        this.userEmail = '';
        this.userAvatar = '/assets/user.png';
      }

    });
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  onLogout(): void {
    this.userApi.logout(); 
    this.closeMobileSidebar();
    this.router.navigate(['/login']);
  }
}