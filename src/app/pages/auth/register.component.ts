import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './auth.component.css'
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  mobile = '';
  password = '';
  errorMessage = signal('');
  successMessage = signal('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    this.errorMessage.set('');
    this.loading.set(true);
    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      mobile: this.mobile,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Account created — you can log in now.');
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Registration failed. Please check your details.');
      }
    });
  }
}
