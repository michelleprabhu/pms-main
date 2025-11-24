import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GoalsLibraryService } from '../../services/goals-library.service';

interface ScoreCard {
  employeeName: string;
  reviewPeriod: string;
  status: string;
}

interface Goal {
  id: number;
  name: string;
  description: string;
  successCriteria: string;
  status: string;
  weight: number;
  reviewPeriod: string;
  startDate: string;
  endDate: string;
  addedBy: 'HR' | 'Manager' | 'Employee';
}

interface PlanningComment {
  id: number;
  role: 'HR' | 'Manager' | 'Employee';
  text: string;
  timestamp: Date;
}

interface Competency {
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number;
}

interface Value {
  name: string;
  description: string;
}

@Component({
  selector: 'app-score-card-details',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './score-card-details.html',
  styleUrl: './score-card-details.css',
})
export class ScoreCardDetails implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'goals';
  scoreCard: ScoreCard | null = null;
  scoreCardId: number = 0;
  newComment: string = '';
  apiUrl = 'http://localhost:5003/api';
  employeeInfo: any = null;

  // Add Goal Modal
  showAddGoalModal: boolean = false;
  selectedLibraryGoal: string = '';
  libraryGoals: any[] = [];
  isLoadingLibraryGoals = false;
  private goalsLibraryService = inject(GoalsLibraryService);

  newGoal = {
    name: '',
    description: '',
    status: '',
    weight: 0,
    startDate: '',
    endDate: '',
    deadlineDate: ''
  };
  goalsWeightage: number = 60;
  competenciesWeightage: number = 25;
  valuesWeightage: number = 15;
  planningProgress: any = {
    HR: { count: 0, total_weight: 0 },
    Manager: { count: 0, total_weight: 0 },
    Employee: { count: 0, total_weight: 0 },
    total_weight: 0
  };

  goals: Goal[] = [];

  planningComments: PlanningComment[] = [];

  competencies: Competency[] = [];

  values: Value[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {
    // Initialize with null - will be loaded from API
    this.scoreCard = null;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.scoreCardId = +params['id'] || 0;
      if (this.scoreCardId) {
        this.loadScoreCardDetails();
        this.loadGoals();
      }
    });
  }

  loadScoreCardDetails() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('Score card details:', response);

        // Update weightage
        this.goalsWeightage = response.goals_weightage || 60;
        this.competenciesWeightage = response.competencies_weightage || 25;
        this.valuesWeightage = response.values_weightage || 15;

        // Update score card info
        this.scoreCard = {
          employeeName: response.employee?.full_name || 'Unknown',
          reviewPeriod: response.review_period?.period_name || 'N/A',
          status: response.status || 'planning'
        };

        // Store employee info for display
        this.employeeInfo = response.employee;
      },
      error: (err) => {
        console.error('Failed to load score card details:', err);
        // Fallback to default
        this.scoreCard = {
          employeeName: 'Unknown',
          reviewPeriod: 'N/A',
          status: 'planning'
        };
      }
    });
  }

  loadGoals() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Load weightage first
    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/weightage`, { headers }).subscribe({
      next: (response: any) => {
        this.goalsWeightage = response.goals_weightage || 60;
        this.competenciesWeightage = response.competencies_weightage || 25;
        this.valuesWeightage = response.values_weightage || 15;
      },
      error: (err) => {
        console.error('Failed to load weightage', err);
      }
    });

    // Load goals
    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/goals`, { headers }).subscribe({
      next: (response: any) => {
        this.goalsWeightage = response.goals_weightage || this.goalsWeightage;
        this.planningProgress = response.planning_progress;

        // Map backend response to frontend format
        this.goals = response.goals.map((goal: any) => ({
          id: goal.id,
          name: goal.goal_name,
          description: goal.description || '',
          successCriteria: goal.success_criteria || '',
          status: goal.status || 'active',
          weight: goal.weight,
          reviewPeriod: 'Q1 2025',
          startDate: goal.start_date || '',
          endDate: goal.end_date || '',
          addedBy: goal.added_by_role
        }));
      },
      error: (err) => {
        console.error('Failed to load goals', err);
        // Keep empty array if error
        this.goals = [];
      }
    });
  }

  updateWeightage() {
    const total = this.goalsWeightage + this.competenciesWeightage + this.valuesWeightage;
    if (total !== 100) {
      alert(`Total weightage must equal 100%. Current total: ${total}%`);
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.put(`${this.apiUrl}/score-cards/${this.scoreCardId}/weightage`, {
      goals_weightage: this.goalsWeightage,
      competencies_weightage: this.competenciesWeightage,
      values_weightage: this.valuesWeightage
    }, { headers }).subscribe({
      next: (response: any) => {
        alert('Weightage updated successfully!');
      },
      error: (err) => {
        console.error('Failed to update weightage', err);
        alert('Error: ' + (err.error?.error || 'Failed to update weightage'));
      }
    });
  }

  getTotalWeight(): number {
    return this.goals.reduce((total, goal) => total + goal.weight, 0);
  }

  isPlanningPhase(): boolean {
    if (!this.scoreCard) return false;
    const planningStatuses = ['planning', 'Plan Started', 'Planning in Progress', 'Pending Employee Acceptance', 'pending_acceptance'];
    return planningStatuses.includes(this.scoreCard.status);
  }

  getGoalsByRole(role: 'HR' | 'Manager' | 'Employee'): Goal[] {
    return this.goals.filter(goal => goal.addedBy === role);
  }

  getGoalsWeightByRole(role: 'HR' | 'Manager' | 'Employee'): number {
    return this.getGoalsByRole(role).reduce((total, goal) => total + goal.weight, 0);
  }

  canSendForAcceptance(): boolean {
    return this.getTotalWeight() === this.goalsWeightage;
  }

  getTotalWeightage(): number {
    return this.goalsWeightage + this.competenciesWeightage + this.valuesWeightage;
  }

  onWeightageChange() {
    // Auto-adjust other sliders to maintain 100% total
    const total = this.getTotalWeightage();
    if (total > 100) {
      const excess = total - 100;
      if (this.competenciesWeightage > 0) {
        this.competenciesWeightage = Math.max(0, this.competenciesWeightage - excess);
      }
      if (this.valuesWeightage > 0 && this.getTotalWeightage() > 100) {
        this.valuesWeightage = Math.max(0, this.valuesWeightage - (this.getTotalWeightage() - 100));
      }
    }
  }

  sendForEmployeeAcceptance() {
    if (!this.canSendForAcceptance()) {
      alert(`Total goal weight must equal ${this.goalsWeightage}%. Current: ${this.getTotalWeight()}%`);
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${this.apiUrl}/score-cards/${this.scoreCardId}/send-for-acceptance`, {}, { headers }).subscribe({
      next: (response: any) => {
        if (this.scoreCard) {
          this.scoreCard.status = 'Pending Employee Acceptance';
        }
        alert('Score card sent for employee acceptance!');
      },
      error: (err) => {
        console.error('Failed to send for acceptance', err);
        alert('Error: ' + (err.error?.error || 'Failed to send for acceptance'));
      }
    });
  }

  addComment() {
    if (this.newComment.trim()) {
      this.planningComments.push({
        id: this.planningComments.length + 1,
        role: 'HR', // In a real app, get from current user
        text: this.newComment.trim(),
        timestamp: new Date()
      });
      this.newComment = '';
      // In a real app, save to backend
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'HR':
        return 'badge-hr';
      case 'Manager':
        return 'badge-manager';
      case 'Employee':
        return 'badge-employee';
      default:
        return '';
    }
  }

  getGoalRowClass(addedBy: string): string {
    switch (addedBy) {
      case 'HR':
        return 'goal-row-hr';
      case 'Manager':
        return 'goal-row-manager';
      case 'Employee':
        return 'goal-row-employee';
      default:
        return '';
    }
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

  navigateToReviewPeriod() {
    this.router.navigate(['/review-period']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/evaluation-periods']);
  }

  acceptGoal(goal: Goal) {
    // Accept individual goal - remove it from the list or mark as accepted
    const index = this.goals.indexOf(goal);
    if (index > -1) {
      this.goals.splice(index, 1);
      console.log('Goal accepted and removed:', goal.name);
      // In a real app, save to backend
    }
  }

  rejectGoal(goal: Goal) {
    // Reject individual goal - remove it from the list or mark as rejected
    const index = this.goals.indexOf(goal);
    if (index > -1) {
      this.goals.splice(index, 1);
      console.log('Goal rejected and removed:', goal.name);
      // In a real app, save to backend
    }
  }

  acceptScoreCard() {
    if (this.scoreCard) {
      this.scoreCard.status = 'Plan Finalized';
      console.log('Score card accepted');
      // In a real app, save to backend
    }
  }

  rejectScoreCard() {
    if (this.scoreCard) {
      this.scoreCard.status = 'Plan Started';
      console.log('Score card rejected');
      // In a real app, save to backend
    }
  }

  showAcceptRejectButtons(): boolean {
    return this.scoreCardId === 1 && this.scoreCard?.status === 'Pending Employee Acceptance';
  }

  openAddGoalModal() {
    console.log('[DEBUG] openAddGoalModal called');
    console.log('[DEBUG] Setting showAddGoalModal to true');
    this.showAddGoalModal = true;
    console.log('[DEBUG] showAddGoalModal is now:', this.showAddGoalModal);
    this.loadLibraryGoals();
    this.resetGoalForm();
    console.log('[DEBUG] Modal should be visible now');
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
      deadlineDate: ''
    };
    this.selectedLibraryGoal = '';
  }

  loadLibraryGoals() {
    this.isLoadingLibraryGoals = true;
    this.goalsLibraryService.getAllGoals().subscribe({
      next: (goals: any) => {
        this.libraryGoals = goals || [];
        this.isLoadingLibraryGoals = false;
      },
      error: (err) => {
        console.error('Failed to load library goals:', err);
        this.libraryGoals = [];
        this.isLoadingLibraryGoals = false;
      }
    });
  }

  onLibraryGoalSelected() {
    if (this.selectedLibraryGoal) {
      const goal = this.libraryGoals.find(g => g.id === +this.selectedLibraryGoal);
      if (goal) {
        this.newGoal.name = goal.goal_name || goal.name;
        this.newGoal.description = goal.description || '';
        this.newGoal.weight = goal.suggested_weight ? parseInt(goal.suggested_weight) : 0;
      }
    } else {
      this.newGoal.name = '';
      this.newGoal.description = '';
      this.newGoal.weight = 0;
    }
  }

  addGoal() {
    if (!this.newGoal.name || !this.newGoal.weight) {
      alert('Please fill in goal name and weight');
      return;
    }

    if (!this.scoreCardId) {
      alert('No score card ID found');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Not authenticated');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload: any = {
      goal_name: this.newGoal.name,
      description: this.newGoal.description || null,
      weight: this.newGoal.weight
    };

    if (this.selectedLibraryGoal) {
      payload.library_goal_id = parseInt(this.selectedLibraryGoal);
    }

    if (this.newGoal.startDate) payload.start_date = this.newGoal.startDate;
    if (this.newGoal.endDate) payload.end_date = this.newGoal.endDate;
    if (this.newGoal.deadlineDate) payload.deadline_date = this.newGoal.deadlineDate;
    if (this.newGoal.status) payload.status = this.newGoal.status;

    this.http.post(`${this.apiUrl}/score-cards/${this.scoreCardId}/goals`, payload, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Goal added successfully!');
          this.closeAddGoalModal();
          this.loadGoals(); // Reload goals list
        },
        error: (err) => {
          console.error('Error adding goal:', err);
          alert(err.error?.error || 'Failed to add goal. Please try again.');
        }
      });
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

