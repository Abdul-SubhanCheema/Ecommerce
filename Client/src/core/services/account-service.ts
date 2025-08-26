import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../types/user';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http=inject(HttpClient);
  private router=inject(Router);
  CurrentUser=signal<User | null>(null);

  baseUrl="http://localhost:5262/api";

  login(creds:any){
    return this.http.post<User>(this.baseUrl+'/account/login',creds).pipe(
      tap(user=>{
        if(user){
          localStorage.setItem("user",JSON.stringify(user));
          this.CurrentUser.set(user);
        }
      })
    );
  }

  logout(){
    localStorage.removeItem("user");
    this.CurrentUser.set(null);
    this.router.navigateByUrl("/");
  }
}
