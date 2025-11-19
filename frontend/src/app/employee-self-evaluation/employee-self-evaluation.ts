import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ReviewPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
}

@Component({
  selector: 'app-employee-self-evaluation',
  imports: [CommonModule],
  templateUrl: './employee-self-evaluation.html',
  styleUrl: './employee-self-evaluation.css',
})
export class EmployeeSelfEvaluationComponent {
  isSidebarCollapsed = false;
  employeeName = 'Sarah Johnson';

  activeReviewPeriods: ReviewPeriod[] = [
    { id: 1, name: 'Q1 2025', startDate: 'Jan 1, 2025', endDate: 'Mar 31, 2025', status: 'Active', progress: 60 }
  ];

  completedReviewPeriods: ReviewPeriod[] = [
    { id: 3, name: 'Q3 2024', startDate: 'Jul 1, 2024', endDate: 'Sep 30, 2024', status: 'Completed', progress: 100 },
    { id: 4, name: 'Q2 2024', startDate: 'Apr 1, 2024', endDate: 'Jun 30, 2024', status: 'Completed', progress: 100 },
    { id: 5, name: 'Q1 2024', startDate: 'Jan 1, 2024', endDate: 'Mar 31, 2024', status: 'Completed', progress: 100 },
    { id: 6, name: 'Annual 2023', startDate: 'Jan 1, 2023', endDate: 'Dec 31, 2023', status: 'Completed', progress: 100 }
  ];

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/employee-dashboard']);
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

  viewSelfEvaluationDetails(reviewPeriodId: number) {
    this.router.navigate(['/employee-self-evaluation-details'], { queryParams: { id: reviewPeriodId } });
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

