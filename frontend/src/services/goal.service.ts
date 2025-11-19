import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = '/api/goals';

  constructor(private http: HttpClient) {}

  createGoal(goalData: any): Observable<any> {
    return this.http.post(this.apiUrl, goalData);
  }

  getGoals(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}