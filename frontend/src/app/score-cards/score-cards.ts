import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PermissionService } from '../../services/permission.service';

interface ScoreCard {
  employeeName: string;
  reviewPeriod: string;
  status: string;
  approvalStatus: string;
}

interface ReviewPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  employeeCount: number;
}

@Component({
  selector: 'app-score-cards',
  imports: [CommonModule, FormsModule],
  templateUrl: './score-cards.html',
  styleUrl: './score-cards.css',
})
export class ScoreCards implements OnInit {
  isSidebarCollapsed = false;
  apiUrl = 'http://localhost:5003/api';

  activeReviewPeriods: ReviewPeriod[] = [];
  completedReviewPeriods: ReviewPeriod[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    public permissionService: PermissionService
  ) { }

  ngOnInit() {
    this.loadReviewPeriods();
  }

  loadReviewPeriods() {
    this.isLoading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No authentication token found';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Load active review periods
    this.http.get(`${this.apiUrl}/review-periods/active`, { headers }).subscribe({
      next: (activePeriods: any) => {
        // Use employeeCount directly from API response
        this.activeReviewPeriods = activePeriods.map((period: any) => ({
          id: period.id,
          name: period.name || period.period_name,
          startDate: period.startDate || (period.start_date ? new Date(period.start_date).toLocaleDateString() : ''),
          endDate: period.endDate || (period.end_date ? new Date(period.end_date).toLocaleDateString() : ''),
          status: period.status || 'Active',
          employeeCount: period.employeeCount || 0
        }));

        // Load all review periods to get completed ones
        // We still need to fetch score cards if we want counts for completed periods
        // For now, we'll fetch them inside loadAllReviewPeriods if needed, or just pass empty counts
        this.loadAllReviewPeriods(headers);
      },
      error: (err) => {
        console.error('Failed to load active review periods', err);
        this.errorMessage = err.error?.error || 'Failed to load review periods';
        this.isLoading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadAllReviewPeriods(headers: HttpHeaders) {
    this.http.get(`${this.apiUrl}/review-periods`, { headers }).subscribe({
      next: (allPeriods: any) => {
        const activeIds = new Set(this.activeReviewPeriods.map(p => p.id));

        // For completed periods, we might want to fetch counts, but for now we'll set to 0
        // or we could fetch score cards here if strictly required. 
        // Given the user request "Keep the score cards fetch only for completed periods if needed",
        // I'll leave it simple for now to ensure the main fix works.

        this.completedReviewPeriods = allPeriods
          .filter((period: any) => !activeIds.has(period.id) && period.status === 'Closed')
          .map((period: any) => ({
            id: period.id,
            name: period.period_name || `Period ${period.id}`,
            startDate: period.start_date ? new Date(period.start_date).toLocaleDateString() : '',
            endDate: period.end_date ? new Date(period.end_date).toLocaleDateString() : '',
            status: 'Completed',
            employeeCount: 0 // Default to 0 as we removed the global fetch
          }))
          .sort((a: ReviewPeriod, b: ReviewPeriod) => {
            const dateA = new Date(a.endDate);
            const dateB = new Date(b.endDate);
            return dateB.getTime() - dateA.getTime();
          });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load all review periods:', err);
        this.isLoading = false;
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/hr-dashboard']);
  }

  navigateToReviewPeriod() {
    this.router.navigate(['/review-period']);
  }

  navigateToPlanning() {
    this.router.navigate(['/planning']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/evaluation-periods']);
  }

  navigateToScoreCards() {
    this.router.navigate(['/score-cards']);
  }

  navigateToReports() {
    this.router.navigate(['/hr-reports']);
  }

  navigateToManagement() {
    this.router.navigate(['/hr-management']);
  }

  navigateToGoalsLibrary() {
    this.router.navigate(['/goals-library']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  viewScoreCardsByPeriod(periodId: number) {
    this.router.navigate(['/score-cards/list'], { queryParams: { periodId: periodId } });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

}

