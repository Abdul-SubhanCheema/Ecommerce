import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../../core/services/account-service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  protected accountService = inject(AccountService);

  logout() {
    this.accountService.logout();
  }
}
