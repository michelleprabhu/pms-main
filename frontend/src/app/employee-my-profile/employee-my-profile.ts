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
  selector: 'app-employee-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-my-profile.html',
  styleUrls: ['./employee-my-profile.css']
})
export class EmployeeMyProfileComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'scorecards'; // Default to Score Cards tab
  periodId: number = 0;

  // Employee info
  employeeName: string = 'Sarah Johnson';
  employeePosition: string = 'Senior Software Engineer';
  employeeEmail: string = 'sarah.johnson@company.com';
  employeeDepartment: string = 'Engineering';
  employeeManager: string = 'Michael Chen';
  employeeJoinDate: string = 'Jan 15, 2020';

  // Score cards
  activeScoreCard: ScoreCard | null = {
    id: 1,
    reviewPeriod: 'Q1 2025',
    status: 'Planning in Progress',
    startDate: 'Jan 1, 2025',
    endDate: 'Mar 31, 2025'
  };

  pastScoreCards: ScoreCard[] = [
    { id: 2, reviewPeriod: 'Q4 2024', status: 'Evaluation Complete', startDate: 'Oct 1, 2024', endDate: 'Dec 31, 2024' },
    { id: 3, reviewPeriod: 'Q3 2024', status: 'Evaluation Complete', startDate: 'Jul 1, 2024', endDate: 'Sep 30, 2024' },
    { id: 4, reviewPeriod: 'Q2 2024', status: 'Evaluation Complete', startDate: 'Apr 1, 2024', endDate: 'Jun 30, 2024' }
  ];

  // Add Goal Modal
  showAddGoalModal: boolean = false;
  newGoal = {
    name: '',
    description: '',
    status: '',
    weight: 0,
    startDate: '',
    endDate: '',
    deadlineDate: '',
    updatedBy: '',
    performanceDocuments: null as File | null
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 1;
    });
  }

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

  backToReviewPeriods() {
    this.router.navigate(['/employee-score-cards']);
  }

  viewScoreCardDetails(scoreCardId: number) {
    // Navigate to employee score card details
    this.router.navigate(['/employee-score-card-details'], { 
      queryParams: { 
        periodId: this.periodId
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

  openAddGoalModal() {
    this.showAddGoalModal = true;
  }

  closeAddGoalModal() {
    this.showAddGoalModal = false;
    this.resetGoalForm();
  }

  resetGoalForm() {
    this.newGoal = {
      name: '',
      description: '',
      status: '',
      weight: 0,
      startDate: '',
      endDate: '',
      deadlineDate: '',
      updatedBy: '',
      performanceDocuments: null
    };
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.newGoal.performanceDocuments = event.target.files[0];
    }
  }

  addGoal() {
    // Validation
    if (!this.newGoal.name || !this.newGoal.description || !this.newGoal.status || 
        !this.newGoal.weight || !this.newGoal.startDate || !this.newGoal.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Adding goal:', this.newGoal);
    alert('Goal added successfully!');
    this.closeAddGoalModal();
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

