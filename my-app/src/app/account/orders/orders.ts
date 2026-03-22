import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderApiService } from '../../order-api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = false;
  statusFilter = 'all';
  expandedOrderId: string | null = null;
  userId: string = '';

  constructor(private orderApiService: OrderApiService) {
    // Kiểm tra localStorage có tồn tại (tránh lỗi SSR)
    if (typeof localStorage !== 'undefined') {
      this.userId = JSON.parse(localStorage.getItem('user') || '{}')._id || '';
    }
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderApiService.getOrders().subscribe({
      next: (data) => {
        // Filter orders for current user
        this.orders = data.filter((order: any) => order.user === this.userId || order.userId === this.userId);
        this.filterOrders();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    if (this.statusFilter === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.statusFilter);
    }
  }

  toggleOrderExpand(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  cancelOrder(orderId: string): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      this.orderApiService.cancelOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => console.error('Error cancelling order:', err)
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-pending',
      'processing': 'badge-processing',
      'shipped': 'badge-shipped',
      'delivered': 'badge-delivered',
      'cancelled': 'badge-cancelled'
    };
    return statusClasses[status] || 'badge-pending';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusLabels[status] || status;
  }
}