import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ScoreCard {
  id: number;
  reviewPeriod: string;
  status: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-planning-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning-employee-detail.html',
  styleUrls: ['./planning-employee-detail.css']
})
export class PlanningEmployeeDetailComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'scorecards'; // Default to Score Cards tab
  employeeId: number = 0;
  periodId: number = 0;

  // Employee info
  employeeName: string = 'John Doe';
  employeePosition: string = 'Senior Software Engineer';
  employeeEmail: string = 'john.doe@company.com';
  employeeDepartment: string = 'Engineering';
  employeeManager: string = 'Jane Smith';
  employeeJoinDate: string = 'Jan 15, 2020';

  // Score cards
  activeScoreCard: ScoreCard | null = {
    id: 1,
    reviewPeriod: 'Q1 2025',
    status: 'Plan Started',
    startDate: 'Jan 1, 2025',
    endDate: 'Mar 31, 2025'
  };

  pastScoreCards: ScoreCard[] = [
    { id: 2, reviewPeriod: 'Q4 2024', status: 'Evaluation Complete', startDate: 'Oct 1, 2024', endDate: 'Dec 31, 2024' },
    { id: 3, reviewPeriod: 'Q3 2024', status: 'Evaluation Complete', startDate: 'Jul 1, 2024', endDate: 'Sep 30, 2024' },
    { id: 4, reviewPeriod: 'Q2 2024', status: 'Evaluation Complete', startDate: 'Apr 1, 2024', endDate: 'Jun 30, 2024' }
  ];

  // Review Period Selection
  selectedReviewPeriod: string = 'Q1 2025';
  availableReviewPeriods: string[] = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'];

  // Modals
  showCreateScoreCardModal: boolean = false;
  showAddGoalModal: boolean = false;
  showStartProcessModal: boolean = false;
  processFormActiveTab: string = 'goals';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.employeeId = +params['id'];
      // For Jane Smith (id: 2), set blank score card
      if (this.employeeId === 2) {
        this.activeScoreCard = {
          id: 2,
          reviewPeriod: 'Q1 2025',
          status: 'Plan Not Started',
          startDate: 'Jan 1, 2025',
          endDate: 'Mar 31, 2025'
        };
        this.employeeName = 'Jane Smith';
        this.employeePosition = 'Product Manager';
        this.employeeEmail = 'jane.smith@company.com';
      }
    });
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 1;
      // In a real app, fetch employee data based on employeeId and periodId
    });
  }

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

  navigateToReviewPeriods() {
    this.router.navigate(['/review-period']);
  }

  backToEmployeeList() {
    this.router.navigate(['/planning/employees'], { queryParams: { periodId: this.periodId } });
  }

  viewScoreCardDetails(scoreCardId: number) {
    // Navigate to score card details with the score card ID
    // For Jane Smith (employeeId: 2), use scoreCardId: 2 to show blank score card
    const idToUse = this.employeeId === 2 ? 2 : scoreCardId;
    this.router.navigate(['/score-card-details'], { 
      queryParams: { 
        id: idToUse
      } 
    });
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
      case 'Evaluation Complete':
        return 'status-evaluation-complete';
      default:
        return '';
    }
  }

  // Modal methods
  openCreateScoreCardModal() {
    this.showCreateScoreCardModal = true;
  }

  closeCreateScoreCardModal() {
    this.showCreateScoreCardModal = false;
  }

  createScoreCard() {
    // Logic to create score card
    console.log('Creating new score card for employee:', this.employeeId);
    this.closeCreateScoreCardModal();
  }

  openAddGoalModal() {
    this.showAddGoalModal = true;
  }

  closeAddGoalModal() {
    this.showAddGoalModal = false;
  }

  addGoal() {
    // Logic to add goal
    console.log('Adding goal to score card');
    this.closeAddGoalModal();
  }

  openStartProcessModal() {
    this.showStartProcessModal = true;
    this.processFormActiveTab = 'goals';
  }

  closeStartProcessModal() {
    this.showStartProcessModal = false;
  }

  startScoreCardProcess() {
    // Logic to start score card process
    console.log('Starting score card process');
    this.closeStartProcessModal();
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

