import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewPeriodService {
  private apiUrl = 'http://localhost:5002/api/review-periods';

  constructor(private http: HttpClient) {}

  createReviewPeriod(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(this.apiUrl, data, { headers });
  }

  getAllReviewPeriods(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(this.apiUrl, { headers });
  }
}


