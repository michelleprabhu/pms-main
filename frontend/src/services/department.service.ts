import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:5003/api/departments';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllDepartments(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  getDepartmentById(departmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${departmentId}`, { headers: this.getHeaders() });
  }

  createDepartment(departmentData: any): Observable<any> {
    return this.http.post(this.apiUrl, departmentData, { headers: this.getHeaders() });
  }

  updateDepartment(departmentId: number, departmentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${departmentId}`, departmentData, { headers: this.getHeaders() });
  }

  deleteDepartment(departmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${departmentId}`, { headers: this.getHeaders() });
  }
}

