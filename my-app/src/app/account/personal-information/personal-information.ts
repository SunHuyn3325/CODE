import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../user-api.service';

interface AccountUser {
  _id?: string;
  profileName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  avatar?: string;
}

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-information.html',
  styleUrl: './personal-information.css',
})
export class PersonalInformation implements OnInit {
  userId = '';
  isSaving = false;

  form: AccountUser = {
    profileName: '',
    email: '',
    phone: '',
    gender: 'other',
    avatar: '/assets/user.png',
  };

  constructor(private userApi: UserApiService) {}

  ngOnInit(): void {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      this.userId = user._id || user.id || '';
      this.form.profileName = user.profileName || user.fullName || user.FullName || '';
      this.form.email = user.email || user.Email || '';
      this.form.phone = user.phone || user.Phone || user.phoneNumber || '';
      this.form.gender = user.gender || 'other';
      this.form.birthDay = user.birthDay;
      this.form.birthMonth = user.birthMonth;
      this.form.birthYear = user.birthYear;
      this.form.avatar = user.avatar || '/assets/user.png';

      if (this.userId) {
        this.userApi.getUser(this.userId).subscribe({
          next: (res: any) => {
            this.form = {
              ...this.form,
              ...res,
              profileName: res.profileName || this.form.profileName,
              avatar: res.avatar || '/assets/user.png',
            };
          },
          error: () => {
            // Keep local data as fallback.
          },
        });
      }
    } catch {
      this.userId = '';
    }
  }

  saveProfile(): void {
    if (!this.userId || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.userApi.updateUser(this.userId, this.form).subscribe({
      next: (updated: any) => {
        const merged = { ...this.form, ...updated, _id: this.userId };
        localStorage.setItem('user', JSON.stringify(merged));
        this.userApi.setUser(merged);
        this.isSaving = false;
        alert('Cap nhat thong tin thanh cong');
      },
      error: () => {
        this.isSaving = false;
        alert('Cap nhat that bai, vui long thu lai');
      },
    });
  }
}