import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  selector: 'app-manager-score-card-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-score-card-details.html',
  styleUrl: './manager-score-card-details.css',
})
export class ManagerScoreCardDetailsComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'goals';
  scoreCard: ScoreCard | null = null;
  scoreCardId: number = 0;
  periodId: number = 0;
  newComment: string = '';
  apiUrl = 'http://localhost:5003/api';
  planningComments: PlanningComment[] = [];
  goals: Goal[] = [];
  goalsWeightage: number = 60;
  competenciesWeightage: number = 25;
  valuesWeightage: number = 15;
  competencies: Competency[] = [];

  values: Value[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 0;
      if (this.periodId) {
        this.loadScoreCardDetails();
      }
    });
  }

  loadScoreCardDetails() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // First get current user's employee_id
    this.http.get(`${this.apiUrl}/current-user`, { headers }).subscribe({
      next: (user: any) => {
        if (!user.employee_id) {
          console.error('User has no employee_id');
          return;
        }

        // Find score card for this employee and period
        this.http.get(`${this.apiUrl}/score-cards?employee_id=${user.employee_id}&review_period_id=${this.periodId}`, { headers }).subscribe({
          next: (response: any) => {
            const scoreCards = Array.isArray(response) ? response : [];
            if (scoreCards.length > 0) {
              const sc = scoreCards[0];
              this.scoreCardId = sc.id;

              // Get full score card details
              this.http.get(`${this.apiUrl}/score-cards/${sc.id}`, { headers }).subscribe({
                next: (details: any) => {
                  this.scoreCard = {
                    employeeName: details.employee?.full_name || 'Unknown',
                    reviewPeriod: details.review_period?.period_name || 'N/A',
                    createdOn: details.created_at ? new Date(details.created_at).toLocaleDateString() : 'N/A',
                    createdBy: 'HR Admin', // Could fetch from created_by user
                    status: details.status || 'planning'
                  };

                  // Update weightage
                  this.goalsWeightage = details.goals_weightage || 60;
                  this.competenciesWeightage = details.competencies_weightage || 25;
                  this.valuesWeightage = details.values_weightage || 15;

                  // Load goals
                  this.loadGoals();
                  this.loadComments();
                  this.loadCompetencies();
                  this.loadValues();
                },
                error: (err) => {
                  console.error('Failed to load score card details:', err);
                }
              });
            } else {
              // No score card found
              this.scoreCard = {
                employeeName: user.employee?.full_name || user.username || 'Unknown',
                reviewPeriod: 'N/A',
                createdOn: 'N/A',
                createdBy: 'N/A',
                status: 'Not Found'
              };
            }
          },
          error: (err) => {
            console.error('Failed to load score cards:', err);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load current user:', err);
      }
    });
  }

  loadGoals() {
    if (!this.scoreCardId) return;

    const token = localStorage.getItem('token');
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
    this.router.navigate(['/manager-dashboard']);
  }

  navigateToScoreCards() {
    this.router.navigate(['/manager-score-cards']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/manager-evaluation']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Manager-specific permission methods
  canEditGoal(goal: Goal): boolean {
    return goal.addedBy === 'Manager';
  }

  canAcceptRejectGoal(goal: Goal): boolean {
    return goal.addedBy === 'Employee';
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

  acceptGoal(goalId: number) {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal) {
      console.log(`Manager accepted goal: ${goal.name}`);
      // In real app, update backend
      alert(`Goal "${goal.name}" accepted by manager`);
    }
  }

  rejectGoal(goalId: number) {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal) {
      console.log(`Manager rejected goal: ${goal.name}`);
      // In real app, update backend
      if (confirm(`Are you sure you want to reject the goal "${goal.name}"?`)) {
        // Remove the goal from the list
        this.goals = this.goals.filter(g => g.id !== goalId);
        alert(`Goal "${goal.name}" rejected and removed`);
      }
    }
  }

  editGoal(goal: Goal) {
    console.log(`Manager editing goal: ${goal.name}`);
    // In real app, open edit modal
    alert(`Edit functionality for "${goal.name}" would open a modal here`);
  }

  deleteGoal(goalId: number) {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal && confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
      this.goals = this.goals.filter(g => g.id !== goalId);
      console.log(`Manager deleted goal: ${goal.name}`);
      alert(`Goal "${goal.name}" deleted`);
    }
  }

  isPlanningPhase(): boolean {
    if (!this.scoreCard) return false;
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
    console.log('Manager saving and notifying employee');
    alert('Score card saved and notification sent to employee!');
  }

  showAddGoalModal: boolean = false;
  selectedLibraryGoal: string = '';
  libraryGoals: any[] = [];
  isLoadingLibraryGoals = false;

  newGoal = {
    name: '',
    description: '',
    status: '',
    weight: 0,
    startDate: '',
    endDate: '',
    deadlineDate: ''
  };

  openAddGoalModal() {
    this.showAddGoalModal = true;
    this.loadLibraryGoals();
    this.resetGoalForm();
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
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoadingLibraryGoals = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/goals-library`, { headers }).subscribe({
      next: (response: any) => {
        const goals = Array.isArray(response) ? response : (response.goals || []);
        this.libraryGoals = goals;
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
        this.newGoal.weight = goal.suggested_weight ? parseInt(goal.suggested_weight.toString()) : 0;
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

  loadComments() {
    if (!this.scoreCardId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/comments`, { headers }).subscribe({
      next: (comments: any) => {
        this.planningComments = comments.map((c: any) => ({
          id: c.id,
          role: c.role,
          text: c.text,
          timestamp: new Date(c.timestamp)
        }));
      },
      error: (err) => console.error('Failed to load comments:', err)
    });
  }

  addComment() {
    if (!this.newComment.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

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
  newCompetency = { name: '', description: '', targetLevel: '' };

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
          minLevel: c.target_level,
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
  newValue = { name: '', description: '' };

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

