import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserApiService } from '../user-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  loginError: string = '';

  constructor(
    private fb: FormBuilder,
    private userApi: UserApiService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

  }

  onSubmit() {
    if (this.loginForm.invalid) return;
      this.userApi.login(this.loginForm.value).subscribe(
        (res: any) => {
          this.userApi.setUser(res);
          alert("Đăng nhập thành công");
          this.router.navigate(['/account']);
        },
        (err: any) => {
          alert("Sai email hoặc mật khẩu");
          }
        );
      }
  }
