import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserApiService } from '../user-api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {

  signupForm: FormGroup;

  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

  constructor(
    private fb: FormBuilder,
    private userApi: UserApiService,
    private router: Router
  ) {

    this.signupForm = this.fb.group({
      profileName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      gender: [''],
      birthDay: ['', Validators.required],
      birthMonth: ['', Validators.required],
      birthYear: ['', Validators.required],
      marketing: [false]
    }, { validators: this.passwordMatch });

  }

  passwordMatch(group: AbstractControl) {

    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (password !== confirm) {
      return { mismatch: true };
    }

    return null;
  }

  onSubmit() {

    if (this.signupForm.invalid) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    console.log("Signup data:", this.signupForm.value);

    this.userApi.register(this.signupForm.value).subscribe(
      (res: any) => {
        alert("Đăng ký thành công");
        this.router.navigate(['/login']);
      },
      (err: any) => {
        console.log(err);
        alert("Đăng ký thất bại");
      }
    );

  }

}