import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class ManagerScoreCardsComponent {
  isSidebarCollapsed = false;

  activeReviewPeriods: ReviewPeriod[] = [
    { id: 1, name: 'Q1 2025', startDate: 'Jan 1, 2025', endDate: 'Mar 31, 2025', status: 'Active', employeeCount: 3 }
  ];

  completedReviewPeriods: ReviewPeriod[] = [
    { id: 2, name: 'Q4 2024', startDate: 'Oct 1, 2024', endDate: 'Dec 31, 2024', status: 'Completed', employeeCount: 3 },
    { id: 3, name: 'Q3 2024', startDate: 'Jul 1, 2024', endDate: 'Sep 30, 2024', status: 'Completed', employeeCount: 3 },
    { id: 4, name: 'Q2 2024', startDate: 'Apr 1, 2024', endDate: 'Jun 30, 2024', status: 'Completed', employeeCount: 3 }
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

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  viewScoreCardsByPeriod(periodId: number) {
    this.router.navigate(['/manager-score-cards/list'], { queryParams: { periodId: periodId } });
  }
}
