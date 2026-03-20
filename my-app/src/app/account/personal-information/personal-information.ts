import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../user-api.service';
import { Account } from '../../models/Account';

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
  isBrowser = false;

  form: Account = {
    profileName: '',
    email: '',
    phone: '',
    gender: 'other',
    avatar: '/assets/user.png',
  };

  constructor(
    private userApi: UserApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

    if (!this.isBrowser) return;

    const userRaw = localStorage.getItem('user');

    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);

        this.userId = user._id || '';

        this.form = {
          ...this.form,
          profileName: user.profileName || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || 'other',
          birthDay: user.birthDay,
          birthMonth: user.birthMonth,
          birthYear: user.birthYear,
          avatar: user.avatar || '/assets/user.png'
        };

      } catch {}
    }

    this.userApi.getUser(this.userId).subscribe({
      next: (res: any) => {
        console.log('DATA BACKEND:', res);

        this.userId = res._id;

        this.form = {
          ...this.form,
          profileName: res.profileName || '',
          email: res.email || '',
          phone: res.phone || '',
          gender: res.gender || 'other',

          birthDay: res.birthDay || res.birth_day || '',
          birthMonth: res.birthMonth || res.birth_month || '',
          birthYear: res.birthYear || res.birth_year || '',

          avatar: res.avatar || '/assets/user.png'
        };

        if (this.isBrowser) {
          localStorage.setItem('user', JSON.stringify(res));
        }

        this.userApi.setUser(res);
      },
      error: () => {}
    });
  }

  saveProfile(): void {
    if (!this.userId || this.isSaving) return;

    this.isSaving = true;

    this.userApi.updateUser(this.userId, this.form).subscribe({
      next: (updated: any) => {

        const merged = { ...this.form, ...updated };

        if (this.isBrowser) {
          localStorage.setItem('user', JSON.stringify(merged));
        }

        this.userApi.setUser(merged);

        this.isSaving = false;
        alert('Cập nhật thành công');
      },
      error: () => {
        this.isSaving = false;
        alert('Cập nhật thất bại');
      }
    });
  }
}