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
}

@Component({
  selector: 'app-employee-score-cards',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-score-cards.html',
  styleUrl: './employee-score-cards.css',
})
export class EmployeeScoreCardsComponent {
  isSidebarCollapsed = false;
  employeeName = 'Sarah Johnson';

  activeReviewPeriods: ReviewPeriod[] = [
    { id: 1, name: 'Q1 2025', startDate: 'Jan 1, 2025', endDate: 'Mar 31, 2025', status: 'Active' }
  ];

  completedReviewPeriods: ReviewPeriod[] = [
    { id: 2, name: 'Q4 2024', startDate: 'Oct 1, 2024', endDate: 'Dec 31, 2024', status: 'Completed' },
    { id: 3, name: 'Q3 2024', startDate: 'Jul 1, 2024', endDate: 'Sep 30, 2024', status: 'Completed' },
    { id: 4, name: 'Q2 2024', startDate: 'Apr 1, 2024', endDate: 'Jun 30, 2024', status: 'Completed' }
  ];

  constructor(private router: Router) {}

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
    this.router.navigate(['/employee-my-profile'], { queryParams: { periodId: periodId } });
  }
}
