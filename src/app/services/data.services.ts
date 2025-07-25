import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalesRecord {
  date: string;
  company: string;
  red: number;
  yellow: number;
  white: number;
  blue: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private dataUrl = 'assets/sales_data.json';

  constructor(private http: HttpClient) {}

  getSalesData(): Observable<SalesRecord[]> {
    return this.http.get<SalesRecord[]>(this.dataUrl);
  }
}
