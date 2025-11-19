import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation.html',
  styleUrls: ['./evaluation.css']
})
export class EvaluationComponent {
  isSidebarCollapsed = false;

  evaluations = [
    { id: 1, employeeName: 'John Doe', reviewPeriod: 'Q4 2024', employeeScore: 4.2, managerScore: 4.0, hrScore: 4.1, status: 'Evaluation Complete' },
    { id: 2, employeeName: 'Jane Smith', reviewPeriod: 'Q4 2024', employeeScore: 4.5, managerScore: 4.3, hrScore: 4.4, status: 'Evaluation Complete' },
    { id: 3, employeeName: 'Mike Johnson', reviewPeriod: 'Q4 2024', employeeScore: 3.8, managerScore: 3.9, hrScore: 3.9, status: 'Evaluation Complete' },
    { id: 4, employeeName: 'Sarah Williams', reviewPeriod: 'Q3 2024', employeeScore: 4.7, managerScore: 4.5, hrScore: 4.6, status: 'Evaluation Complete' },
    { id: 5, employeeName: 'David Brown', reviewPeriod: 'Q3 2024', employeeScore: 4.0, managerScore: 4.2, hrScore: 4.1, status: 'Evaluation Complete' }
  ];

  constructor(private router: Router) {}

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

  navigateBackToPeriods() {
    this.router.navigate(['/evaluation-periods']);
  }

  viewEvaluationDetails(evaluationId: number) {
    this.router.navigate(['/evaluation-details'], { queryParams: { id: evaluationId } });
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

