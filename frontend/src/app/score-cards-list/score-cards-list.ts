import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ScoreCardEmployee {
  id: number;
  name: string;
  department: string;
  position: string;
  scoreCardStatus: string;
  scoreCardId: number;
}

@Component({
  selector: 'app-score-cards-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './score-cards-list.html',
  styleUrls: ['./score-cards-list.css']
})
export class ScoreCardsListComponent implements OnInit {
  isSidebarCollapsed = false;
  periodId: number = 1;
  reviewPeriodName: string = 'Q1 2025';
  searchQuery: string = '';
  
  employees: ScoreCardEmployee[] = [];
  apiUrl = 'http://localhost:5003/api';

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const periodIdParam = params['periodId'];
      
      // Always default to 2 (the active review period) if no periodId provided
      this.periodId = periodIdParam ? +periodIdParam : 2;
      
      // Always load review period name first, then load employees
      this.loadReviewPeriodNameFirst();
      this.loadEmployees();
    });
  }

  loadReviewPeriodNameFirst() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Always load review period name regardless of whether employees exist
    this.http.get(`${this.apiUrl}/review-periods/${this.periodId}`, { headers }).subscribe({
      next: (period: any) => {
        if (period.period_name) {
          this.reviewPeriodName = period.period_name;
        } else {
          this.reviewPeriodName = `Period ${this.periodId}`;
        }
      },
      error: (err) => {
        console.error('Failed to load review period name:', err);
        this.reviewPeriodName = `Period ${this.periodId}`;
      }
    });
  }

  loadEmployees() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      this.employees = [];
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log(`Loading employees for periodId: ${this.periodId}`);
    console.log(`API URL: ${this.apiUrl}/score-cards?review_period_id=${this.periodId}`);

    // Fetch score cards for this review period
    this.http.get(`${this.apiUrl}/score-cards?review_period_id=${this.periodId}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        // Map score cards to employee list format
        if (Array.isArray(response)) {
          this.employees = response.map((sc: any) => ({
            id: sc.employee_id,
            name: sc.employee?.full_name || 'Unknown',
            department: sc.employee?.department?.name || 'N/A',
            position: sc.employee?.position?.title || 'N/A',
            scoreCardStatus: sc.status || 'planning',
            scoreCardId: sc.id
          }));
          
          // Review period name should already be loaded, but update if we have better data
          if (this.employees.length > 0 && response[0]?.review_period?.period_name) {
            this.reviewPeriodName = response[0].review_period.period_name;
          }
          
          console.log(`Loaded ${this.employees.length} employees:`, this.employees);
        } else {
          console.error('Unexpected response format:', response);
          this.employees = [];
        }
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        if (err.status === 401) {
          alert('Session expired. Please login again.');
          this.router.navigate(['/login']);
        }
        this.employees = [];
      }
    });
  }

  loadReviewPeriodName(periodId: number, headers: HttpHeaders) {
    this.http.get(`${this.apiUrl}/review-periods/${periodId}`, { headers }).subscribe({
      next: (period: any) => {
        if (period.period_name) {
          this.reviewPeriodName = period.period_name;
        }
      },
      error: (err) => {
        console.error('Failed to load review period name:', err);
        // Fallback to default
        this.reviewPeriodName = `Period ${periodId}`;
      }
    });
  }

  getReviewPeriodName(id: number): string {
    // This is now only used as fallback, actual name comes from API
    return this.reviewPeriodName || `Period ${id}`;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/hr-dashboard']);
  }

  navigateToReviewPeriods() {
    this.router.navigate(['/review-period']);
  }

  navigateToPlanning() {
    this.router.navigate(['/planning']);
  }

  navigateToScoreCards() {
    this.router.navigate(['/score-cards']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/evaluation-periods']);
  }

  backToReviewPeriods() {
    this.router.navigate(['/score-cards']);
  }

  viewScoreCardDetail(scoreCardId: number) {
    // Navigate to score card details page using score card ID
    this.router.navigate(['/score-card-details'], { queryParams: { id: scoreCardId } });
  }

  get filteredEmployees() {
    if (!this.searchQuery) {
      return this.employees;
    }
    return this.employees.filter(emp => 
      emp.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Plan Not Started':
        return 'status-plan-not-started';
      case 'Plan Started':
        return 'status-plan-started';
      case 'Planning in Progress':
        return 'status-planning-progress';
      case 'Pending Employee Acceptance':
        return 'status-pending-acceptance';
      case 'Plan Finalized':
        return 'status-plan-finalized';
      case 'Evaluation Started':
        return 'status-evaluation-started';
      case 'Pending Manager Evaluation':
        return 'status-pending-manager';
      case 'Pending HR Evaluation':
        return 'status-pending-hr';
      case 'Evaluation Complete':
        return 'status-evaluation-complete';
      default:
        return '';
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

