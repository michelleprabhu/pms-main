import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ReviewPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  employeeCount: number;
  evaluationsCompleted?: number;
  evaluationsPending?: number;
}

@Component({
  selector: 'app-evaluation-periods',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-periods.html',
  styleUrls: ['./evaluation-periods.css']
})
export class EvaluationPeriodsComponent {
  isSidebarCollapsed = false;

  activeReviewPeriods: ReviewPeriod[] = [
    { id: 1, name: 'Q1 2025', startDate: 'Jan 1, 2025', endDate: 'Mar 31, 2025', status: 'Active', employeeCount: 14, evaluationsCompleted: 7, evaluationsPending: 7 }
  ];

  completedReviewPeriods: ReviewPeriod[] = [
    { id: 3, name: 'Q3 2024', startDate: 'Jul 1, 2024', endDate: 'Sep 30, 2024', status: 'Completed', employeeCount: 248 },
    { id: 4, name: 'Q2 2024', startDate: 'Apr 1, 2024', endDate: 'Jun 30, 2024', status: 'Completed', employeeCount: 240 },
    { id: 5, name: 'Q1 2024', startDate: 'Jan 1, 2024', endDate: 'Mar 31, 2024', status: 'Completed', employeeCount: 235 },
    { id: 6, name: 'Annual 2023', startDate: 'Jan 1, 2023', endDate: 'Dec 31, 2023', status: 'Completed', employeeCount: 220 }
  ];

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/hr-dashboard']);
  }

  navigateToPlanning() {
    this.router.navigate(['/planning']);
  }

  navigateToReviewPeriods() {
    this.router.navigate(['/review-period']);
  }

  navigateToScoreCards() {
    this.router.navigate(['/score-cards']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/evaluation-periods']);
  }

  viewPeriodEvaluations(periodId: number) {
    this.router.navigate(['/evaluation'], { queryParams: { periodId: periodId } });
  }

  viewEmployees(periodId: number) {
    this.router.navigate(['/evaluation'], { queryParams: { periodId: periodId } });
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

