import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private apiUrl = 'http://localhost:5003/api/positions';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllPositions(departmentId?: number): Observable<any> {
    const params: any = {};
    if (departmentId) {
      params.department_id = departmentId.toString();
    }
    return this.http.get(this.apiUrl, { headers: this.getHeaders(), params: Object.keys(params).length > 0 ? params : undefined });
  }

  getPositionById(positionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${positionId}`, { headers: this.getHeaders() });
  }

  createPosition(positionData: any): Observable<any> {
    return this.http.post(this.apiUrl, positionData, { headers: this.getHeaders() });
  }

  updatePosition(positionId: number, positionData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${positionId}`, positionData, { headers: this.getHeaders() });
  }

  deletePosition(positionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${positionId}`, { headers: this.getHeaders() });
  }
}

