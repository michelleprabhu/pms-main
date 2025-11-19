import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr-dashboard',
  imports: [CommonModule],
  templateUrl: './hr-dashboard.html',
  styleUrl: './hr-dashboard.css',
})
export class HrDashboard {
  isSidebarCollapsed = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToReviewPeriod() {
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

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
