import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface ScoreCardEmployee {
  id: number;
  name: string;
  department: string;
  position: string;
  scoreCardStatus: string;
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
  
  // Manager's direct reports only (3 employees)
  employees: ScoreCardEmployee[] = [
    { id: 1, name: 'Sarah Johnson', department: 'Engineering', position: 'Software Engineer', scoreCardStatus: 'Plan Finalized' },
    { id: 2, name: 'Michael Chen', department: 'Engineering', position: 'Frontend Developer', scoreCardStatus: 'Planning in Progress' },
    { id: 3, name: 'Emily Rodriguez', department: 'Engineering', position: 'Backend Developer', scoreCardStatus: 'Plan Not Started' }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 1;
      // Set review period name based on ID
      this.reviewPeriodName = this.getReviewPeriodName(this.periodId);
    });
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
    this.router.navigate(['/manager-score-cards/employee-detail', employeeId], { queryParams: { periodId: this.periodId } });
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

