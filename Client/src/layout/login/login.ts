import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private accountService = inject(AccountService);
  protected creds: any = {};
  protected LoggedIn = signal(false);

  login() {
    this.accountService.login(this.creds).subscribe({
      next: res => {
        console.log(res);
        this.LoggedIn.set(true);
      },
      error: err => console.error('Login failed:', err)
    });
  }
  logout() {
    this.LoggedIn.set
      (false);
  }
}
