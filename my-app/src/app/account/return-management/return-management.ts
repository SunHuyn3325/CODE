import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReturnApiService } from '../../return-api.service';

@Component({
  selector: 'app-return-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-management.html',
  styleUrl: './return-management.css',
})
export class ReturnManagementComponent implements OnInit {
  returns: any[] = [];
  loading = false;
  showReturnForm = false;
  expandedReturnId: string | null = null;
  userId: string = '';
  
  returnForm = {
    orderId: '',
    reason: '',
    description: '',
    quantity: 1
  };

  reasonOptions = [
    'Sản phẩm hư hỏng',
    'Sai kích cỡ/màu sắc',
    'Không như hình ảnh',
    'Thay đổi ý định',
    'Sản phẩm không phù hợp',
    'Khác'
  ];

  constructor(private returnApiService: ReturnApiService) {
    this.userId = JSON.parse(localStorage.getItem('user') || '{}')._id || '';
  }

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(): void {
    this.loading = true;
    this.returns = this.returnApiService.getReturnsByUser(this.userId);
    this.loading = false;
  }

  toggleReturnForm(): void {
    this.showReturnForm = !this.showReturnForm;
    if (!this.showReturnForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.returnForm = {
      orderId: '',
      reason: '',
      description: '',
      quantity: 1
    };
  }

  submitReturn(): void {
    if (!this.returnForm.orderId || !this.returnForm.reason) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newReturn = this.returnApiService.createReturn({
      userId: this.userId,
      ...this.returnForm
    });

    this.loadReturns();
    this.showReturnForm = false;
    this.resetForm();
  }

  toggleReturnExpand(returnId: string): void {
    this.expandedReturnId = this.expandedReturnId === returnId ? null : returnId;
  }

  cancelReturn(returnId: string): void {
    if (confirm('Bạn có chắc chắn muốn hủy yêu cầu đổi trả này?')) {
      this.returnApiService.deleteReturn(returnId);
      this.loadReturns();
    }
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-pending',
      'approved': 'badge-approved',
      'shipped': 'badge-shipped',
      'received': 'badge-received',
      'rejected': 'badge-rejected'
    };
    return statusClasses[status] || 'badge-pending';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'approved': 'Được phê duyệt',
      'shipped': 'Đang gửi lại',
      'received': 'Đã nhận',
      'rejected': 'Bị từ chối'
    };
    return statusLabels[status] || status;
  }
}