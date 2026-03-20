import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../address.service';

interface AccountAddress {
  _id?: string;
  userId: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
}

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address.html',
  styleUrl: './address.css',
})
export class AddressComponent implements OnInit {
  userId = '';
  isEditing = false;
  isSaving = false;

  address: AccountAddress = {
    userId: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
  };

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      this.userId = user._id || user.id || user.CustomerID || '';
      this.address.userId = this.userId;
      this.loadAddress();
    } catch {
      this.userId = '';
    }
  }

  private loadAddress(): void {
    if (!this.userId) {
      return;
    }

    this.addressService.getAddressByUser(this.userId).subscribe({
      next: (res: any) => {
        const value = Array.isArray(res) ? res[0] : res;
        if (value && (value.address || value.city)) {
          this.address = {
            _id: value._id,
            userId: this.userId,
            phone: value.phone || '',
            address: value.address || '',
            ward: value.ward || '',
            district: value.district || '',
            city: value.city || '',
          };
        }
      },
      error: () => {
        // Keep empty form if backend returns no address.
      },
    });
  }

  saveAddress(): void {
    if (this.isSaving || !this.userId) {
      return;
    }

    this.isSaving = true;
    const payload = { ...this.address, userId: this.userId };

    const request$ = this.address._id
      ? this.addressService.updateAddress(this.address._id, payload)
      : this.addressService.createAddress(payload);

    request$.subscribe({
      next: (res: any) => {
        if (res && res._id) {
          this.address._id = res._id;
        }
        this.isSaving = false;
        this.isEditing = false;
        alert('Lưu địa chỉ thành công');
      },
      error: () => {
        this.isSaving = false;
        alert('Lưu địa chỉ thất bại, vui lòng thử lại');
      },
    });
  }
}