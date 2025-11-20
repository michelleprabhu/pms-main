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
  apiUrl = 'http://localhost:5002/api';

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const periodIdParam = params['periodId'];
      
      // Always default to 2 (the active review period) if no periodId provided
      this.periodId = periodIdParam ? +periodIdParam : 2;
      
      this.reviewPeriodName = this.getReviewPeriodName(this.periodId);
      this.loadEmployees();
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

  getReviewPeriodName(id: number): string {
    const periods: { [key: number]: string } = {
      1: 'Q1 2025',
      2: 'Q1 2024',
      3: 'Q1 2023',
      4: 'Q1 2022'
    };
    return periods[id] || 'Q1 2025';
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

