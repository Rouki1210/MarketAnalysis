import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-Home',
  templateUrl: './Home.component.html',
  imports: [CommonModule],
  styleUrls: ['./Home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadData();
  }
  data: any = {};

    loadData() {
    this.http.get('https://localhost:7175/api/Asset').subscribe((a: any) => {
      this.data = a;
      console.log(a);
    });
    
  }
}
