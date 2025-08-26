import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Nav } from "../layout/nav/nav";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Nav,RouterOutlet ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = "Ecommerce App";
  private http = inject(HttpClient);
  protected UsersList=signal<any>([]);

 async ngOnInit() {
    this.UsersList.set(await this.GetUserList());
   
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
