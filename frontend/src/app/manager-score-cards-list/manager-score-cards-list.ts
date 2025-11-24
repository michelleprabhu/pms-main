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
  scoreCardId?: number;
}

@Component({
  selector: 'app-manager-score-cards-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-score-cards-list.html',
  styleUrls: ['./manager-score-cards-list.css']
})
export class ManagerScoreCardsListComponent implements OnInit {
  isSidebarCollapsed = false;
  periodId: number = 1;
  reviewPeriodName: string = 'Q1 2025';
  searchQuery: string = '';
  employees: ScoreCardEmployee[] = [];
  isLoading = false;
  errorMessage = '';
  private apiUrl = 'http://localhost:5003/api';

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 1;
      this.loadEmployees();
    });
  }

  loadEmployees() {
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

    const url = `${this.apiUrl}/score-cards/manager/my-team${this.periodId ? `?review_period_id=${this.periodId}` : ''}`;
    console.log('Loading team score cards from:', url);

    this.http.get(url, { headers }).subscribe({
      next: (response: any) => {
        if (response.score_cards && Array.isArray(response.score_cards)) {
          this.employees = response.score_cards.map((sc: any) => ({
            id: sc.employee_id,
            name: sc.employee?.full_name || 'Unknown',
            department: sc.employee?.department?.name || 'N/A',
            position: sc.employee?.position?.title || 'N/A',
            scoreCardStatus: this.mapStatusToDisplay(sc.status),
            scoreCardId: sc.id
          }));
          
          // Set review period name from first score card if available
          if (this.employees.length > 0 && response.score_cards[0]?.review_period) {
            this.reviewPeriodName = response.score_cards[0].review_period.period_name;
          } else {
            this.reviewPeriodName = this.getReviewPeriodName(this.periodId);
          }
        } else {
          this.employees = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load team score cards:', err);
        this.errorMessage = err.error?.error || 'Failed to load team score cards';
        this.isLoading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  mapStatusToDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'planning': 'Planning in Progress',
      'plan_finalized': 'Plan Finalized',
      'pending_acceptance': 'Pending Employee Acceptance',
      'evaluation_started': 'Evaluation Started',
      'pending_manager_evaluation': 'Pending Manager Evaluation',
      'pending_hr_evaluation': 'Pending HR Evaluation',
      'evaluation_complete': 'Evaluation Complete'
    };
    return statusMap[status] || status;
  }

  getReviewPeriodName(id: number): string {
    const periods: { [key: number]: string } = {
      1: 'Q1 2025',
      2: 'Q4 2024',
      3: 'Q3 2024',
      4: 'Q2 2024'
    };
    return periods[id] || 'Q1 2025';
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

  backToReviewPeriods() {
    this.router.navigate(['/manager-score-cards']);
  }

  viewScoreCardDetail(employeeId: number) {
    // Find the score card ID for this employee
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (employee && employee.scoreCardId) {
      this.router.navigate(['/manager-score-cards/employee-detail', employeeId], { 
        queryParams: { 
          periodId: this.periodId,
          scoreCardId: employee.scoreCardId
        } 
      });
    } else {
      this.router.navigate(['/manager-score-cards/employee-detail', employeeId], { 
        queryParams: { periodId: this.periodId } 
      });
    }
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

