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
  scoreCardId?: number;
}

@Component({
  selector: 'app-employee-score-cards',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-score-cards.html',
  styleUrl: './employee-score-cards.css',
})
export class EmployeeScoreCardsComponent implements OnInit {
  isSidebarCollapsed = false;
  employeeName = '';
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
    this.loadEmployeeName();
    this.loadScoreCards();
  }

  loadEmployeeName() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.employeeName = user.username || user.email || 'Employee';
      } catch (e) {
        this.employeeName = 'Employee';
      }
    }
  }

  loadScoreCards() {
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

    this.http.get(`${this.apiUrl}/score-cards/employee/my-score-cards`, { headers }).subscribe({
      next: (response: any) => {
        if (response.score_cards && Array.isArray(response.score_cards)) {
          const now = new Date();
          this.activeReviewPeriods = [];
          this.completedReviewPeriods = [];

          response.score_cards.forEach((sc: any) => {
            const period = sc.review_period;
            if (!period) return;

            const endDate = period.end_date ? new Date(period.end_date) : null;
            const isActive = period.status === 'Open' || (endDate && endDate >= now);

            const reviewPeriod: ReviewPeriod = {
              id: period.id,
              name: period.period_name || `Period ${period.id}`,
              startDate: this.formatDate(period.start_date),
              endDate: this.formatDate(period.end_date),
              status: isActive ? 'Active' : 'Completed',
              scoreCardId: sc.id
            };

            if (isActive) {
              this.activeReviewPeriods.push(reviewPeriod);
            } else {
              this.completedReviewPeriods.push(reviewPeriod);
            }
          });

          // Sort active by start date (newest first), completed by end date (newest first)
          this.activeReviewPeriods.sort((a, b) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          this.completedReviewPeriods.sort((a, b) => 
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
          );
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load score cards:', err);
        this.errorMessage = err.error?.error || 'Failed to load score cards';
        this.isLoading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
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
    this.router.navigate(['/employee-dashboard']);
  }

  navigateToScoreCards() {
    this.router.navigate(['/employee-score-cards']);
  }

  navigateToSelfEvaluation() {
    this.router.navigate(['/employee-self-evaluation']);
  }

  navigateToMyScoreCard() {
    this.router.navigate(['/employee-score-cards']);
  }

  navigateToRatings() {
    this.router.navigate(['/employee-ratings']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  viewScoreCardDetails(periodId: number) {
    // Find the score card ID for this period
    const allPeriods = [...this.activeReviewPeriods, ...this.completedReviewPeriods];
    const period = allPeriods.find(p => p.id === periodId);
    
    if (period && period.scoreCardId) {
      this.router.navigate(['/employee-my-profile'], { 
        queryParams: { 
          periodId: periodId,
          scoreCardId: period.scoreCardId
        } 
      });
    } else {
      this.router.navigate(['/employee-my-profile'], { 
        queryParams: { periodId: periodId } 
      });
    }
  }
}
