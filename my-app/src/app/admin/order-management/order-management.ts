
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderApiService } from '../../order-api.service';
import { AddressService } from '../../address.service';
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
    private addressService: AddressService,
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
        // compute subtotal and total for orders that don't include them
        this.orders.forEach(o => {
          try {
            const items = o.orderItems || (o as any).items || [];
            const sub = items.reduce((acc: number, it: any) => {
              const p = Number(it.price || it.unit_price || 0) || 0;
              const q = Number(it.qty || it.quantity || it.qtyOrdered || 0) || 0;
              return acc + p * q;
            }, 0);
            if (o.subTotal == null) o.subTotal = sub;
            if (o.shippingFee == null && (o as any).shipping_fee != null) o.shippingFee = (o as any).shipping_fee;
            if (o.totalPrice == null) o.totalPrice = (Number(o.subTotal || 0) || 0) + (Number(o.shippingFee || 0) || 0);
          } catch (e) {}
        });

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
    // clone to avoid mutating list view state
    this.selectedOrder = { ...order };

    // Try to attach saved address object for display (address, ward, city)
    const uid = order?.user || order?.userId || (typeof localStorage !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}')._id) || '';
    if (!uid) return;

    this.addressService.getAddressByUser(uid).subscribe({
      next: (addr: any) => {
        // normalize various address shapes
        let addrString = '';
        if (!addr) addrString = '';
        else if (typeof addr === 'string') addrString = addr;
        else if (addr.address) addrString = addr.address;
        else if (addr.fullAddress) addrString = addr.fullAddress;
        else {
          const parts: string[] = [];
          if (addr.houseNumber) parts.push(addr.houseNumber);
          if (addr.street) parts.push(addr.street);
          if (addr.address) parts.push(addr.address);
          if (addr.ward) parts.push(addr.ward);
          if (addr.district) parts.push(addr.district);
          if (addr.city) parts.push(addr.city);
          if (addr.province) parts.push(addr.province);
          addrString = parts.filter(Boolean).join(', ');
        }

        if (this.selectedOrder) {
          this.selectedOrder.shippingAddress = this.selectedOrder.shippingAddress || addrString;
          if (addr && typeof addr === 'object') this.selectedOrder.shippingAddressObj = addr;
          if (!this.selectedOrder.customerInfo) this.selectedOrder.customerInfo = {};
          this.selectedOrder.customerInfo.address = this.selectedOrder.customerInfo.address || addrString;
          // compute subtotal if missing
          try {
            const items = this.selectedOrder.orderItems || (this.selectedOrder as any).items || [];
            const sub = items.reduce((acc: number, it: any) => {
              const p = Number(it.price || it.unit_price || 0) || 0;
              const q = Number(it.qty || it.quantity || it.qtyOrdered || 0) || 0;
              return acc + p * q;
            }, 0);
            if (this.selectedOrder.subTotal == null) this.selectedOrder.subTotal = sub;
          } catch (e) {}
          // compute shipping fee if missing
          if (this.selectedOrder.shippingFee == null) {
            if ((this.selectedOrder as any).shipping_fee != null) this.selectedOrder.shippingFee = (this.selectedOrder as any).shipping_fee;
            else {
              const cityCandidate = (addr && typeof addr === 'object' ? addr.city : '') || addrString || this.selectedOrder.customerInfo?.address;
              const fee = this.computeShippingFeeFromLocation(cityCandidate);
              this.selectedOrder.shippingFee = fee;
              console.log('admin computed shipping fee for selectedOrder', this.selectedOrder._id, 'cityCandidate=', cityCandidate, 'fee=', fee);
            }
          }
          // compute total
          this.selectedOrder.totalPrice = (Number(this.selectedOrder.subTotal || 0) || 0) + (Number(this.selectedOrder.shippingFee || 0) || 0);
          console.log('admin selectedOrder totals:', { orderId: this.selectedOrder._id, subTotal: this.selectedOrder.subTotal, shippingFee: this.selectedOrder.shippingFee, totalPrice: this.selectedOrder.totalPrice });
        }

        // ensure modal updates
        try { this.cdr.detectChanges(); } catch (e) {}
      },
      error: () => {
        // ignore missing address
      }
    });
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

  // Compute shipping fee based on city/location: HCM city => 25000, others => 35000
  private computeShippingFeeFromLocation(loc?: string | null): number {
    const raw = (loc || '').toString().toLowerCase().trim();
    if (!raw) return 35000;
    let normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    normalized = normalized.replace(/\s|\.|\-/g, '');
    if (normalized.includes('hochiminh') || normalized.includes('tphcm') || normalized.includes('hcm')) return 25000;
    return 35000;
  }

}
