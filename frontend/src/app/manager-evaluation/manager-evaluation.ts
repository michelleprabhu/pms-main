import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-evaluation.html',
  styleUrls: ['./manager-evaluation.css']
})
export class ManagerEvaluationComponent {
  isSidebarCollapsed = false;

  evaluations = [
    { id: 1, employeeName: 'Sarah Johnson', reviewPeriod: 'Q1 2025', employeeScore: 4.2, managerScore: 4.0, hrScore: null, status: 'Pending HR Evaluation' },
    { id: 2, employeeName: 'Michael Chen', reviewPeriod: 'Q1 2025', employeeScore: 4.5, managerScore: null, hrScore: null, status: 'Pending Manager Evaluation' },
    { id: 3, employeeName: 'Emily Rodriguez', reviewPeriod: 'Q1 2025', employeeScore: null, managerScore: null, hrScore: null, status: 'Evaluation Started' }
  ];

  constructor(private router: Router) {}

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

  navigateBackToPeriods() {
    this.router.navigate(['/manager-evaluation-periods']);
  }

  viewEvaluationDetails(evaluationId: number) {
    this.router.navigate(['/manager-evaluation-details'], { queryParams: { id: evaluationId } });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Evaluation Started':
        return 'status-evaluation-started';
      case 'Pending Manager Evaluation':
        return 'status-pending-manager';
      case 'Pending HR Evaluation':
        return 'status-pending-hr';
      case 'Pending Employee Acceptance':
        return 'status-pending-acceptance';
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

