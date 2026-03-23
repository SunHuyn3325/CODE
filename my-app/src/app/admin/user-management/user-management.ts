import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../user-api.service';
import { AddressService } from '../../address.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];

  searchText: string = '';

  currentPage = 1;
  totalPages = 1;
  pageSize = 10;

  editingUserId: string | null = null;
  editedUser: any = {};

  showAddUserForm = false;
  newUser: any = {
    profileName: '',
    email: '',
    password: '',
    gender: 'Nam',
    phone: '',
    address: '',
    role: 'user'
  };


  constructor(private userService: UserApiService, private addressService: AddressService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Template wrapper to format address consistently
  formatAddress(addr: any): string {
    return this.addressService.formatAddress(addr) || '-';
  }

  // load user
  loadUsers() {
    this.userService.getUsers().subscribe((data: any) => {
      this.users = data;
      // for each user, attempt to fetch their address(es) from AddressService
      // and attach a formatted address string to display in the table
      (this.users || []).forEach((u: any) => {
        if (!u) return;
        try {
          this.addressService.getAddressByUser(u._id).subscribe({
            next: (addrRes: any) => {
              // addrRes may be an array or single object
              const addrObj = Array.isArray(addrRes) ? (addrRes[0] || null) : (addrRes || null);
              u._shippingAddressObj = addrObj;
              const formatted = this.addressService.formatAddress(addrObj);
              u._formattedAddress = formatted || (u.address || '');
            },
            error: (err) => {
              // fallback: keep existing user.address
              u._formattedAddress = u.address || '';
            }
          });
        } catch (e) {
          u._formattedAddress = u.address || '';
        }
      });
      // Debug: show sample of address-related fields so we can confirm shape
      try {
        console.log('UserManagement.loadUsers - users sample:', (data || []).slice(0,5).map((u: any) => ({
          _id: u._id,
          profileName: u.profileName,
          address_field: u.address,
          shippingAddress: (u as any).shippingAddress || null,
          addresses: (u as any).addresses || null
        })));
      } catch (e) {
        console.log('UserManagement.loadUsers - preview failed', e);
      }
      this.filteredUsers = [...this.users];
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
      this.updatePagination();
    });
  }

  // SEARCH
  searchUser() {
    const keyword = this.searchText.toLowerCase();

    if (!keyword) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.profileName?.toLowerCase().includes(keyword) ||
        user.phone?.includes(keyword)
      );
    }

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.updatePagination();
  }
  // PAGINATION
  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // EDIT USER
  editUser(user: any) {
    this.editingUserId = user._id;
    this.editedUser = { ...user };

    // Ensure the edit form's address field is populated with the formatted address.
    // If the formatted address was already fetched, use it; otherwise request it now.
    if (user._formattedAddress) {
      this.editedUser.address = user._formattedAddress;
    } else {
      try {
        this.addressService.getAddressByUser(user._id).subscribe({
          next: (addrRes: any) => {
            const addrObj = Array.isArray(addrRes) ? (addrRes[0] || null) : (addrRes || null);
            const formatted = this.addressService.formatAddress(addrObj);
            this.editedUser.address = formatted || (user.address || '');
            // cache on the original user object so table reflects it immediately
            user._formattedAddress = this.editedUser.address;
          },
          error: () => {
            this.editedUser.address = user.address || '';
          }
        });
      } catch (e) {
        this.editedUser.address = user.address || '';
      }
    }
  }

  cancelEditing() {
    this.editingUserId = null;
  }

  saveEditing(userId: string) {
    this.userService.updateUser(userId, this.editedUser).subscribe({
      next: () => {
        const index = this.users.findIndex(u => u._id === userId);
        if (index !== -1) {
          this.users[index] = { ...this.editedUser };
        }
        this.filteredUsers = [...this.users];
        this.updatePagination();
        this.editingUserId = null;
      },
      error: (err) => {
        console.error("Update user lỗi:", err);
      }
    });
  }

  // DELETE USER
  deleteUser(userId: string) {
    if (!confirm("Bạn có chắc muốn xóa user này?")) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== userId);
        this.filteredUsers = [...this.users];
        this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        this.updatePagination();
      },
      error: () => {
        alert("Xóa thất bại");
      }
    });
  }

  // nút thêm user (tạm thời)
  openAddUser() {
    this.showAddUserForm = true;
    this.newUser = {
      profileName: '',
      email: '',
      password: '',
      gender: 'Nam',
      phone: '',
      address: '',
      role: 'user'
    };
  }

  cancelAddUser() {
    this.showAddUserForm = false;
  }

  addUser() {
    // validate dữ liệu bắt buộc
    if (!this.newUser.profileName || !this.newUser.email || !this.newUser.password) {
      alert('Vui lòng nhập đầy đủ tên, email và mật khẩu');
      return;
    }

    // gọi API thêm user
    this.userService.addUser(this.newUser).subscribe({
      next: () => {
        alert('Thêm người dùng thành công!');
        this.showAddUserForm = false;
        this.loadUsers(); // reload bảng user
      },
      error: (err) => {
        console.error(err);
        alert('Có lỗi xảy ra khi thêm người dùng');
      }
    });
  }

}

// helper wrapper for templates will be used to format addresses as "address, ward, city"
// keeps logic in AddressService and avoids duplicating normalization code here
export interface _UserManagementInternal {}