import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GoalsLibraryService } from '../../services/goals-library.service';

interface ScoreCard {
  employeeName: string;
  reviewPeriod: string;
  createdOn: string;
  createdBy: string;
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

interface PlanningComment {
  id: number;
  role: 'HR' | 'Manager' | 'Employee';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-employee-score-card-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-score-card-details.html',
  styleUrl: './employee-score-card-details.css',
})
export class EmployeeScoreCardDetailsComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'goals';
  employeeName = '';
  scoreCard: ScoreCard | null = null;
  scoreCardId: number = 0;
  newComment: string = '';
  periodId: number = 1;
  apiUrl = 'http://localhost:5003/api';
  goalsWeightage: number = 60;
  competenciesWeightage: number = 25;
  valuesWeightage: number = 15;

  // Add Goal Modal
  showAddGoalModal: boolean = false;
  selectedLibraryGoal: string = '';
  libraryGoals: any[] = [];
  isLoadingLibraryGoals = false;
  private goalsLibraryService = inject(GoalsLibraryService);
  private http = inject(HttpClient);

  planningComments: PlanningComment[] = [];
  goals: Goal[] = [];
  competencies: Competency[] = [];
  values: Value[] = [];

  newGoal = {
    name: '',
    description: '',
    status: '',
    weight: 0,
    startDate: '',
    endDate: '',
    deadlineDate: ''
  };

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 0;
      this.scoreCardId = +params['scoreCardId'] || 0;

      if (this.scoreCardId) {
        this.loadScoreCardDetails();
        this.loadGoals();
      } else if (this.periodId) {
        this.loadScoreCardByPeriod();
      } else {
        // Try to get current user's score card
        this.loadCurrentUserScoreCard();
      }

      this.loadEmployeeData();
    });
  }

  loadEmployeeData() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot load employee data');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Use current-user endpoint which includes employee data
    this.http.get(`${this.apiUrl}/current-user`, { headers }).subscribe({
      next: (user: any) => {
        console.log('[EmployeeScoreCardDetails] User data loaded:', user);
        if (user.employee && user.employee.full_name) {
          this.employeeName = user.employee.full_name;
          console.log('[EmployeeScoreCardDetails] Set employeeName to:', this.employeeName);
        } else if (user.username) {
          this.employeeName = user.username;
          console.log('[EmployeeScoreCardDetails] Set employeeName to username:', this.employeeName);
        } else if (user.email) {
          this.employeeName = user.email.split('@')[0];
          console.log('[EmployeeScoreCardDetails] Set employeeName to email prefix:', this.employeeName);
        } else {
          this.employeeName = 'Employee';
          console.log('[EmployeeScoreCardDetails] Set employeeName to default:', this.employeeName);
        }
      },
      error: (err) => {
        console.error('[EmployeeScoreCardDetails] Failed to load user data:', err);
        this.employeeName = 'Employee';
      }
    });
  }

  loadScoreCardDetails() {
    if (!this.scoreCardId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}`, { headers }).subscribe({
      next: (response: any) => {
        // Update employee name from score card if available
        if (response.employee?.full_name) {
          this.employeeName = response.employee.full_name;
        }

        this.scoreCard = {
          employeeName: response.employee?.full_name || this.employeeName || 'Unknown',
          reviewPeriod: response.review_period?.period_name || 'N/A',
          createdOn: response.created_at ? new Date(response.created_at).toLocaleDateString() : 'N/A',
          createdBy: 'HR Admin', // Could fetch from created_by user
          status: response.status || 'planning'
        };

        this.goalsWeightage = response.goals_weightage || 60;
        this.competenciesWeightage = response.competencies_weightage || 25;
        this.valuesWeightage = response.values_weightage || 15;

        this.loadGoals();
        this.loadComments();
        this.loadCompetencies();
        this.loadValues();
      },
      error: (err) => {
        console.error('Failed to load score card details:', err);
      }
    });
  }

  loadScoreCardByPeriod() {
    const token = localStorage.getItem('token');
    if (!token || !this.periodId) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Get current user's employee ID first
    this.http.get(`${this.apiUrl}/current-user`, { headers }).subscribe({
      next: (user: any) => {
        if (user.employee && user.employee.id) {
          // Get score card for this employee and period
          this.http.get(`${this.apiUrl}/score-cards?employee_id=${user.employee.id}&review_period_id=${this.periodId}`, { headers }).subscribe({
            next: (response: any) => {
              const scoreCards = Array.isArray(response) ? response : [];
              if (scoreCards.length > 0) {
                const sc = scoreCards[0];
                this.scoreCardId = sc.id;
                this.loadScoreCardDetails();
              }
            },
            error: (err) => {
              console.error('Failed to load score card:', err);
            }
          });
        } else {
          console.warn('User does not have an employee record');
        }
      },
      error: (err) => {
        console.error('Failed to load user data:', err);
      }
    });
  }

  loadCurrentUserScoreCard() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/score-cards/employee/my-score-cards`, { headers }).subscribe({
      next: (response: any) => {
        const scoreCards = response.score_cards || [];
        if (scoreCards.length > 0) {
          // Get the most recent or active one
          const sc = scoreCards[0];
          this.scoreCardId = sc.id;
          this.periodId = sc.review_period_id;
          this.loadScoreCardDetails();
        }
      },
      error: (err) => {
        console.error('Failed to load score cards:', err);
      }
    });
  }

  loadGoals() {
    if (!this.scoreCardId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/goals`, { headers }).subscribe({
      next: (response: any) => {
        this.goals = (response.goals || []).map((goal: any) => ({
          id: goal.id,
          name: goal.goal_name,
          description: goal.description || '',
          successCriteria: goal.success_criteria || '',
          status: goal.status || 'active',
          weight: goal.weight,
          reviewPeriod: this.scoreCard?.reviewPeriod || 'N/A',
          startDate: goal.start_date || '',
          endDate: goal.end_date || '',
          addedBy: goal.added_by_role
        }));
      },
      error: (err) => {
        console.error('Failed to load goals:', err);
        this.goals = [];
      }
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

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Employee-specific permission methods
  canEditGoal(goal: Goal): boolean {
    return goal.addedBy === 'Employee';
  }

  canDeleteGoal(goal: Goal): boolean {
    return goal.addedBy === 'Employee';
  }

  isViewOnlyGoal(goal: Goal): boolean {
    return goal.addedBy === 'HR' || goal.addedBy === 'Manager';
  }

  getGoalsByRole(role: 'HR' | 'Manager' | 'Employee'): Goal[] {
    return this.goals.filter(goal => goal.addedBy === role);
  }

  getGoalsWeightByRole(role: 'HR' | 'Manager' | 'Employee'): number {
    return this.goals
      .filter(goal => goal.addedBy === role)
      .reduce((sum, goal) => sum + goal.weight, 0);
  }

  getTotalWeight(): number {
    return this.goals.reduce((sum, goal) => sum + goal.weight, 0);
  }

  getRoleBadgeClass(role: 'HR' | 'Manager' | 'Employee'): string {
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

  getGoalRowClass(role: 'HR' | 'Manager' | 'Employee'): string {
    switch (role) {
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

  editGoal(goal: Goal) {
    if (!this.canEditGoal(goal)) {
      alert('You can only edit your own goals');
      return;
    }
    console.log(`Employee editing goal: ${goal.name}`);
    alert(`Edit functionality for "${goal.name}" would open a modal here`);
  }

  deleteGoal(goalId: number) {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal && this.canDeleteGoal(goal)) {
      if (confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
        this.goals = this.goals.filter(g => g.id !== goalId);
        console.log(`Employee deleted goal: ${goal.name}`);
        alert(`Goal "${goal.name}" deleted`);
      }
    } else {
      alert('You can only delete your own goals');
    }
  }

  isPlanningPhase(): boolean {
    if (!this.scoreCard) return false;
    // Keep this broad for general planning UI elements
    const planningStatuses = ['planning', 'Plan Started', 'Planning in Progress', 'Pending Employee Acceptance', 'pending_acceptance'];
    return planningStatuses.includes(this.scoreCard.status);
  }

  canSaveAndNotify(): boolean {
    return this.getTotalWeight() === 100;
  }

  saveAndNotify() {
    if (!this.canSaveAndNotify()) {
      alert('Total weight must equal 100% before saving and notifying');
      return;
    }
    console.log('Employee saving and notifying manager');
    alert('Score card saved and notification sent to manager!');
  }

  openAddGoalModal() {
    this.showAddGoalModal = true;
    this.loadLibraryGoals();
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

  closeAddGoalModal() {
    this.showAddGoalModal = false;
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
      alert('No active score card found');
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
      weight: this.newGoal.weight,
      added_by_role: 'Employee'
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
          this.loadGoals();
        },
        error: (err) => {
          console.error('Failed to add goal:', err);
          alert('Error: ' + (err.error?.error || 'Failed to add goal'));
        }
      });
  }

  // Acceptance Flow
  showRejectModal = false;
  rejectionReason = '';

  isPendingAcceptance(): boolean {
    if (!this.scoreCard) return false;
    return ['Pending Employee Acceptance', 'pending_acceptance'].includes(this.scoreCard.status);
  }

  isEditingPhase(): boolean {
    if (!this.scoreCard) return false;
    return ['planning', 'Plan Started', 'Planning in Progress'].includes(this.scoreCard.status);
  }

  acceptScoreCard() {
    if (!confirm('Are you sure you want to accept this performance plan?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${this.apiUrl}/score-cards/${this.scoreCardId}/accept`, {}, { headers }).subscribe({
      next: (response: any) => {
        alert('Score card accepted successfully!');
        this.loadScoreCardDetails();
      },
      error: (err) => {
        console.error('Failed to accept score card:', err);
        alert('Error: ' + (err.error?.error || 'Failed to accept score card'));
      }
    });
  }

  openRejectModal() {
    this.showRejectModal = true;
    this.rejectionReason = '';
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectionReason = '';
  }

  rejectScoreCard() {
    if (!this.rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${this.apiUrl}/score-cards/${this.scoreCardId}/reject`, { reason: this.rejectionReason }, { headers }).subscribe({
      next: (response: any) => {
        alert('Score card rejected successfully!');
        this.closeRejectModal();
        this.loadScoreCardDetails();
      },
      error: (err) => {
        console.error('Failed to reject score card:', err);
        alert('Error: ' + (err.error?.error || 'Failed to reject score card'));
      }
    });
  }

  loadComments() {
    if (!this.scoreCardId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/comments`, { headers }).subscribe({
      next: (comments: any) => {
        this.planningComments = comments.map((c: any) => ({
          id: c.id,
          role: c.role, // Backend should return role name
          text: c.text,
          timestamp: new Date(c.timestamp)
        }));
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
      }
    });
  }

  addComment() {
    if (!this.newComment.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${this.apiUrl}/score-cards/${this.scoreCardId}/comments`, { text: this.newComment.trim() }, { headers }).subscribe({
      next: (comment: any) => {
        this.planningComments.push({
          id: comment.id,
          role: comment.role,
          text: comment.text,
          timestamp: new Date(comment.timestamp)
        });
        this.newComment = '';
      },
      error: (err) => {
        console.error('Failed to add comment:', err);
        alert('Error: ' + (err.error?.error || 'Failed to add comment'));
      }
    });
  }

  // Competencies Logic
  showAddCompetencyModal = false;
  libraryCompetencies: any[] = [];
  isLoadingLibraryCompetencies = false;
  selectedLibraryCompetency = '';
  newCompetency = {
    name: '',
    description: '',
    targetLevel: ''
  };

  loadCompetencies() {
    if (!this.scoreCardId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/competencies`, { headers }).subscribe({
      next: (comps: any) => {
        this.competencies = comps.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          minLevel: c.target_level, // Using minLevel to display target level for now
          maxLevel: ''
        }));
      },
      error: (err) => console.error('Failed to load competencies:', err)
    });
  }

  openAddCompetencyModal() {
    this.showAddCompetencyModal = true;
    this.loadLibraryCompetencies();
    this.newCompetency = { name: '', description: '', targetLevel: '' };
    this.selectedLibraryCompetency = '';
  }

  closeAddCompetencyModal() {
    this.showAddCompetencyModal = false;
  }

  loadLibraryCompetencies() {
    this.isLoadingLibraryCompetencies = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`${this.apiUrl}/competencies-library`, { headers }).subscribe({
      next: (comps: any) => {
        this.libraryCompetencies = comps || [];
        this.isLoadingLibraryCompetencies = false;
      },
      error: (err) => {
        console.error('Failed to load library competencies:', err);
        this.isLoadingLibraryCompetencies = false;
      }
    });
  }

  onLibraryCompetencySelected() {
    if (this.selectedLibraryCompetency) {
      const comp = this.libraryCompetencies.find(c => c.id === +this.selectedLibraryCompetency);
      if (comp) {
        this.newCompetency.name = comp.competency_name;
        this.newCompetency.description = comp.description;
      }
    } else {
      this.newCompetency.name = '';
      this.newCompetency.description = '';
    }
  }

  addCompetency() {
    if (!this.newCompetency.name) {
      alert('Please enter competency name');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const payload: any = {
      name: this.newCompetency.name,
      description: this.newCompetency.description,
      target_level: this.newCompetency.targetLevel
    };
    if (this.selectedLibraryCompetency) {
      payload.library_id = +this.selectedLibraryCompetency;
    }

    this.http.post(`${this.apiUrl}/score-cards/${this.scoreCardId}/competencies`, payload, { headers }).subscribe({
      next: () => {
        alert('Competency added successfully');
        this.closeAddCompetencyModal();
        this.loadCompetencies();
      },
      error: (err) => {
        console.error('Failed to add competency:', err);
        alert('Error: ' + (err.error?.error || 'Failed to add competency'));
      }
    });
  }

  // Values Logic
  showAddValueModal = false;
  libraryValues: any[] = [];
  isLoadingLibraryValues = false;
  selectedLibraryValue = '';
  newValue = {
    name: '',
    description: ''
  };

  loadValues() {
    if (!this.scoreCardId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/values`, { headers }).subscribe({
      next: (vals: any) => {
        this.values = vals.map((v: any) => ({
          id: v.id,
          name: v.name,
          description: v.description
        }));
      },
      error: (err) => console.error('Failed to load values:', err)
    });
  }

  openAddValueModal() {
    this.showAddValueModal = true;
    this.loadLibraryValues();
    this.newValue = { name: '', description: '' };
    this.selectedLibraryValue = '';
  }

  closeAddValueModal() {
    this.showAddValueModal = false;
  }

  loadLibraryValues() {
    this.isLoadingLibraryValues = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`${this.apiUrl}/values-library`, { headers }).subscribe({
      next: (vals: any) => {
        this.libraryValues = vals || [];
        this.isLoadingLibraryValues = false;
      },
      error: (err) => {
        console.error('Failed to load library values:', err);
        this.isLoadingLibraryValues = false;
      }
    });
  }

  onLibraryValueSelected() {
    if (this.selectedLibraryValue) {
      const val = this.libraryValues.find(v => v.id === +this.selectedLibraryValue);
      if (val) {
        this.newValue.name = val.value_name || val.name;
        this.newValue.description = val.description;
      }
    } else {
      this.newValue.name = '';
      this.newValue.description = '';
    }
  }

  addValue() {
    if (!this.newValue.name) {
      alert('Please enter value name');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const payload: any = {
      name: this.newValue.name,
      description: this.newValue.description
    };
    if (this.selectedLibraryValue) {
      payload.library_id = +this.selectedLibraryValue;
    }

    this.http.post(`${this.apiUrl}/score-cards/${this.scoreCardId}/values`, payload, { headers }).subscribe({
      next: () => {
        alert('Value added successfully');
        this.closeAddValueModal();
        this.loadValues();
      },
      error: (err) => {
        console.error('Failed to add value:', err);
        alert('Error: ' + (err.error?.error || 'Failed to add value'));
      }
    });
  }
}
