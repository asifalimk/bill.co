import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  readonly error = signal('');
  readonly submitting = signal(false);
  username = '';
  password = '';

  @Output() readonly loginSuccess = new EventEmitter<void>();

  async submit(): Promise<void> {
    if (this.submitting()) {
      return;
    }
    this.error.set('');
    this.submitting.set(true);
    try {
      await this.auth.login(this.username, this.password);
      this.password = '';
      this.loginSuccess.emit();
    } catch (error: unknown) {
      this.error.set(error instanceof HttpErrorResponse && error.status === 401
        ? 'Invalid username or password.'
        : 'Unable to reach the authentication service. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
