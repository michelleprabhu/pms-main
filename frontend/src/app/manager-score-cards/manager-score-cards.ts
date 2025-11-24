import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ReviewPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  employeeCount: number;
}

@Component({
  selector: 'app-manager-score-cards',
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-score-cards.html',
  styleUrl: './manager-score-cards.css',
})
export class ManagerScoreCardsComponent implements OnInit {
  isSidebarCollapsed = false;
  activeReviewPeriods: ReviewPeriod[] = [];
  completedReviewPeriods: ReviewPeriod[] = [];
  isLoading = false;
  errorMessage = '';
  private apiUrl = 'http://localhost:5003/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

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
        // Get team score cards to count employees per period
        this.http.get(`${this.apiUrl}/score-cards/manager/my-team`, { headers }).subscribe({
          next: (teamResponse: any) => {
            const scoreCards = teamResponse.score_cards || [];
            
            // Count employees per period
            const periodCounts: { [key: number]: number } = {};
            scoreCards.forEach((sc: any) => {
              const periodId = sc.review_period_id;
              if (!periodCounts[periodId]) {
                periodCounts[periodId] = 0;
              }
              periodCounts[periodId]++;
            });

            // Map active periods with employee counts
            this.activeReviewPeriods = activePeriods.map((period: any) => ({
              id: period.id,
              name: period.name,
              startDate: period.startDate,
              endDate: period.endDate,
              status: period.status || 'Active',
              employeeCount: periodCounts[period.id] || 0
            }));

            // Load all review periods to get completed ones
            this.loadAllReviewPeriods(headers, periodCounts);
          },
          error: (err) => {
            console.error('Failed to load team score cards:', err);
            // Still load periods without counts
            this.activeReviewPeriods = activePeriods.map((period: any) => ({
              id: period.id,
              name: period.name,
              startDate: period.startDate,
              endDate: period.endDate,
              status: period.status || 'Active',
              employeeCount: 0
            }));
            this.loadAllReviewPeriods(headers, {});
          }
        });
      },
      error: (err) => {
        console.error('Failed to load active review periods:', err);
        this.errorMessage = err.error?.error || 'Failed to load review periods';
        this.isLoading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadAllReviewPeriods(headers: HttpHeaders, periodCounts: { [key: number]: number }) {
    // Get all review periods to find completed ones
    this.http.get(`${this.apiUrl}/review-periods`, { headers }).subscribe({
      next: (allPeriods: any) => {
        const activeIds = new Set(this.activeReviewPeriods.map(p => p.id));
        
        this.completedReviewPeriods = allPeriods
          .filter((period: any) => !activeIds.has(period.id) && period.status === 'Closed')
          .map((period: any) => ({
            id: period.id,
            name: period.period_name || `Period ${period.id}`,
            startDate: this.formatDate(period.start_date),
            endDate: this.formatDate(period.end_date),
            status: 'Completed',
            employeeCount: periodCounts[period.id] || 0
          }))
          .sort((a: ReviewPeriod, b: ReviewPeriod) => {
            // Sort by end_date descending (newest first)
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/manager-dashboard']);
  }

  navigateToScoreCards() {
    this.router.navigate(['/manager-score-cards']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/manager-evaluation-periods']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  viewScoreCardsByPeriod(periodId: number) {
    // Use the actual period ID from the clicked period
    this.router.navigate(['/manager-score-cards/list'], { queryParams: { periodId: periodId } });
  }

  navigateToMyProfile() {
    this.router.navigate(['/manager-my-profile']);
  }
}
