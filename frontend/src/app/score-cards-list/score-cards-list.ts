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
  
  employees: ScoreCardEmployee[] = [
    { id: 1, name: 'John Doe', department: 'Engineering', position: 'Senior Software Engineer', scoreCardStatus: 'Plan Started' },
    { id: 2, name: 'Jane Smith', department: 'Engineering', position: 'Product Manager', scoreCardStatus: 'Plan Not Started' },
    { id: 3, name: 'Mike Johnson', department: 'Sales', position: 'Sales Manager', scoreCardStatus: 'Pending Employee Acceptance' },
    { id: 4, name: 'Sarah Williams', department: 'HR', position: 'HR Manager', scoreCardStatus: 'Plan Finalized' },
    { id: 5, name: 'Robert Brown', department: 'Engineering', position: 'Software Engineer', scoreCardStatus: 'Planning in Progress' },
    { id: 6, name: 'Emily Davis', department: 'Marketing', position: 'Marketing Director', scoreCardStatus: 'Plan Started' },
    { id: 7, name: 'James Wilson', department: 'Finance', position: 'Financial Analyst', scoreCardStatus: 'Plan Started' },
    { id: 8, name: 'Linda Martinez', department: 'Operations', position: 'Operations Manager', scoreCardStatus: 'Planning in Progress' }
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

  viewScoreCardDetail(employeeId: number) {
    this.router.navigate(['/score-cards/employee-detail', employeeId], { queryParams: { periodId: this.periodId } });
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

