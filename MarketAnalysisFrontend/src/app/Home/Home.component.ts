import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../signalr.service';

@Component({
  selector: 'app-Home',
  templateUrl: './Home.component.html',
  imports: [CommonModule],
  styleUrls: ['./Home.component.css']
})
export class HomeComponent implements OnInit {
  data: any = {};
  latestPrice: any;

  constructor(
    private http: HttpClient, 
    private signalRService: SignalRService
  ) { }

  ngOnInit() {
    this.loadData();
    this.signalRService.startConnection();

    setInterval(() => {
      this.latestPrice = this.signalRService.priceData;
    }, 1000);
  }

    loadData() {
    this.http.get('https://localhost:7175/api/Asset').subscribe((a: any) => {
      this.data = a;
      console.log(a);
    });
  }
}
