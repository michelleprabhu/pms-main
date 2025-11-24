import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5003/api/employees';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllEmployees(includeInactive: boolean = false): Observable<any> {
    const params: any = {};
    if (includeInactive) {
      params.include_inactive = 'true';
    }
    return this.http.get(this.apiUrl, { headers: this.getHeaders(), params: Object.keys(params).length > 0 ? params : undefined });
  }

  getEmployeeById(employeeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${employeeId}`, { headers: this.getHeaders() });
  }

  createEmployee(employeeData: any): Observable<any> {
    return this.http.post(this.apiUrl, employeeData, { headers: this.getHeaders() });
  }

  updateEmployee(employeeId: number, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${employeeId}`, employeeData, { headers: this.getHeaders() });
  }

  deleteEmployee(employeeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${employeeId}`, { headers: this.getHeaders() });
  }
}

