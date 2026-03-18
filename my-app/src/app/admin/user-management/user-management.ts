import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../user-api.service';

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

  constructor(private userService: UserApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // load user
  loadUsers() {
  this.userService.getUsers().subscribe((data:any) => {
    this.users = data;

    this.filteredUsers = [...this.users];

    this.currentPage = 1;

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

    alert("Chức năng thêm user đang phát triển");

  }

}