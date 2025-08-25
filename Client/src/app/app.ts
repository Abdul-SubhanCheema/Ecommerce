import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Nav } from "../layout/nav/nav";
import { Login } from "../layout/login/login";
import { AccountService } from '../core/services/account-service';

@Component({
  selector: 'app-root',
  imports: [Nav, Login],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private accountService=inject(AccountService);
  protected readonly title = "Ecommerce App";
  private http = inject(HttpClient);
  protected UsersList=signal<any>([]);

 async ngOnInit() {
    this.UsersList.set(await this.GetUserList());
  }
  SetCurrentUser(){
    const userString =localStorage.getItem("user");
    if(!userString) return ;
    const user=JSON.parse(userString);
    this.accountService.CurrentUser.set(user);

  }
  async GetUserList(){
    try {
      return lastValueFrom(this.http.get("http://localhost:5262/api/users"));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  
}
