
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderApiService } from '../../order-api.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.html',
  styleUrls: ['./order-management.css']
})
export class OrderManagement implements OnInit {

  orders: any[] = [];
  filteredOrders: any[] = [];
  searchText: string = '';
  selectedStatus: string = '';
  filterOption = 'orderId';

  currentPage = 1;
  pageSize = 5;

  totalOrders = 0;
  totalPages = 1;

  loading = true;

  statusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'delivered', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  constructor(
    private orderService: OrderApiService,
     private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {

    this.orderService.getOrders().subscribe({
      next: (data: any[]) => {
        this.orders = [...data];
        this.filteredOrders = [...data];
        this.totalOrders = this.orders.length;
        this.totalPages = Math.ceil(this.totalOrders / this.pageSize);

      },
      error: (err) => {
        console.error('Lỗi tải đơn hàng:', err);
        this.loading = false;
      }
    });
    this.loading = false;
  }

  filterOrders(): void {

    let result = [...this.orders];

    // search
    if (this.searchText) {

      const text = this.searchText.toLowerCase();

      if (this.filterOption === 'orderId') {

        result = result.filter(order =>
          order._id?.toLowerCase().includes(text)
        );

      } else {

        result = result.filter(order =>
          order.userName?.toLowerCase().includes(text)
        );

      }

    }

    // filter status
    if (this.selectedStatus) {

      result = result.filter(order =>
        order.status === this.selectedStatus
      );

    }

    this.filteredOrders = result;

    this.totalOrders = this.filteredOrders.length;
    this.totalPages = Math.ceil(this.totalOrders / this.pageSize);

    this.currentPage = 1;

  }

  updateOrderStatus(order: any, status: string): void {

    this.orderService.updateOrderStatus(order._id, status)
      .subscribe({

        next: () => {

          order.status = status;

        },

        error: (err) => {

          console.error("Lỗi cập nhật trạng thái:", err);

        }

      });

  }

  togglePaid(order: any, paid: boolean) {
    // Gọi API cập nhật trạng thái thanh toán (chỉ gửi status, cập nhật isPaid local)
    this.orderService.updateOrderStatus(order._id, order.status).subscribe({
      next: () => {
        order.isPaid = paid;
        // Có thể thêm thông báo cho khách hàng tại đây
      },
      error: () => {
        alert('Cập nhật trạng thái thanh toán thất bại!');
      }
    });
  }



  cancelOrder(order: any): void {
    if (!confirm('Bạn có chắc muốn huỷ đơn này?')) return;
    this.orderService.cancelOrder(order._id).subscribe({
      next: () => {
        // đổi trạng thái ngay trên bảng
        order.status = 'cancelled';
      },
      error: () => {
        alert('Huỷ đơn thất bại');
      }
    });
  }

  // --- Các hàm modal chi tiết đơn hàng ---
  selectedOrder: any = null;

  showOrderDetail(order: any) {
  this.selectedOrder = { ...order };
  }

  closeOrderDetail() {
    this.selectedOrder = null;
  }

  exportInvoice(order: any) {
    // Placeholder: xuất hóa đơn, có thể dùng window.print() hoặc tạo PDF
    alert('Chức năng xuất hóa đơn sẽ được phát triển!');
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  get paginatedOrders() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredOrders.slice(start, end);
  }

}
