import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../address.service';
import { LocationApiService } from '../../location-api.service';

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

  formAddress: AccountAddress = {
    userId: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
  };

  // 👉 DROPDOWN DATA
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];

  selectedProvince: any;
  selectedDistrict: any;
  selectedWard: any;

  constructor(
    private addressService: AddressService,
    private locationService: LocationApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // load tỉnh
    this.locationService.getProvinces().subscribe({
      next: (data) => {
        console.log("PROVINCES:", data); // 👈 thêm dòng này
        this.provinces = data;
      },
      error: (err) => {
        console.error("ERROR LOAD LOCATION:", err);
      }
    });

    // load user
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;

    try {
      const user = JSON.parse(userRaw);
      this.userId = user._id || user.id || '';
      this.address.userId = this.userId;
      this.loadAddress();
    } catch {
      this.userId = '';
    }
  }

  private loadAddress(): void {
    if (!this.userId) return;

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
        } else {
          this.isEditing = true;
        }
      },
      error: () => {
        this.isEditing = true;
      },
    });
  }

  startEdit() {
    this.formAddress = { ...this.address };
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  // 👉 CHỌN TỈNH
  onProvinceChange(event: any) {
    const code = Number(event.target.value);

    this.selectedProvince = this.provinces.find(p => p.code === code);
    this.formAddress.city = this.selectedProvince?.name || '';

    this.locationService.getDistricts(code).subscribe(data => {
      this.districts = data;
      this.wards = [];
    });
  }

  // 👉 CHỌN QUẬN
  onDistrictChange(event: any) {
    const code = Number(event.target.value);

    this.selectedDistrict = this.districts.find(d => d.code === code);
    this.formAddress.district = this.selectedDistrict?.name || '';

    this.locationService.getWards(code).subscribe(data => {
      this.wards = data;
    });
  }

  // 👉 CHỌN PHƯỜNG
  onWardChange(event: any) {
    const code = Number(event.target.value);

    this.selectedWard = this.wards.find(w => w.code === code);
    this.formAddress.ward = this.selectedWard?.name || '';
  }

  saveAddress(): void {
    if (this.isSaving || !this.userId) return;

    this.isSaving = true;

    const payload = {
      ...this.formAddress,
      userId: this.userId,
    };

    const request$ = this.address._id
      ? this.addressService.updateAddress(this.address._id, payload)
      : this.addressService.createAddress(payload);

    request$.subscribe({
      next: (res: any) => {
        this.address = res;
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