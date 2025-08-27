import { Component, inject } from '@angular/core';
import {Location} from "@angular/common"
@Component({
  selector: 'app-notfound',
  imports: [],
  templateUrl: './notfound.html',
  styleUrl: './notfound.css'
})
export class Notfound {
  private location=inject(Location);

  GoBack(){
    this.location.back();
  }

}
