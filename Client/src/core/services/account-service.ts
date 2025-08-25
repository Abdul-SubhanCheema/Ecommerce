import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../types/user';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http=inject(HttpClient);
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
  }
}
