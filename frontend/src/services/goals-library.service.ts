import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GoalsLibraryService {
  private apiUrl = 'http://localhost:5003/api/goals-library';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllGoals(category?: string, goalType?: string, includeInactive?: boolean): Observable<any> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    if (goalType) {
      params = params.set('goal_type', goalType);
    }
    if (includeInactive) {
      params = params.set('include_inactive', 'true');
    }
    return this.http.get(this.apiUrl, { headers: this.getHeaders(), params }).pipe(
      map((response: any) => {
        // Handle both array response and object with goals property
        return Array.isArray(response) ? response : (response.goals || response.data || []);
      })
    );
  }

  getGoalById(goalId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${goalId}`, { headers: this.getHeaders() });
  }

  createGoal(goalData: any): Observable<any> {
    return this.http.post(this.apiUrl, goalData, { headers: this.getHeaders() });
  }

  updateGoal(goalId: number, goalData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${goalId}`, goalData, { headers: this.getHeaders() });
  }

  deleteGoal(goalId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${goalId}`, { headers: this.getHeaders() });
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`, { headers: this.getHeaders() });
  }
}

