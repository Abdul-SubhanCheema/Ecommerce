import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private accountService = inject(AccountService);
  private toast=inject(ToastService);
  private router=inject(Router);
  protected creds: any = {};
  protected LoggedIn = signal(false);

  login() {
    this.accountService.login(this.creds).subscribe({
      next: res => {
        console.log(res);
        this.toast.success("Logged in Successfully");
        this.router.navigateByUrl("/adminhome");
        this.creds={};
      },
      error: err => {
        console.error('Login failed:', err)
        this.toast.error(err.error)
      }
    });
  }
  logout() {
    this.accountService.logout();
    this.router.navigateByUrl("/");
  }
}
