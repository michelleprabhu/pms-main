import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-management.html',
  styleUrls: ['./hr-management.css']
})
export class HrManagementComponent {
  isSidebarCollapsed = false;

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

  navigateToScoreCards() {
    this.router.navigate(['/score-cards']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/evaluation-periods']);
  }

  navigateToReports() {
    this.router.navigate(['/hr-reports']);
  }

  navigateToManagement() {
    this.router.navigate(['/hr-management']);
  }

  navigateToReviewPeriod() {
    this.router.navigate(['/review-period']);
  }

  navigateToEmployees() {
    this.router.navigate(['/hr-employees']);
  }

  navigateToDepartments() {
    this.router.navigate(['/hr-departments']);
  }

  navigateToPositions() {
    this.router.navigate(['/hr-positions']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}










