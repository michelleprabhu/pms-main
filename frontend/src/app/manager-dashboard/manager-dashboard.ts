import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-dashboard',
  imports: [CommonModule],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.css',
})
export class ManagerDashboard {
  isSidebarCollapsed = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/manager-dashboard']);
  }

  navigateToReviewPeriods() {
    this.router.navigate(['/manager-review-period']);
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
}
