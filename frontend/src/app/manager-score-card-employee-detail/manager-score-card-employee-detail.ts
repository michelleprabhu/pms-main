import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GoalsLibraryService } from '../../services/goals-library.service';

interface ScoreCard {
  id: number;
  reviewPeriod: string;
  status: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-manager-score-card-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-score-card-employee-detail.html',
  styleUrls: ['./manager-score-card-employee-detail.css']
})
export class ManagerScoreCardEmployeeDetailComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'scorecards'; // Default to Score Cards tab
  employeeId: number = 0;
  periodId: number = 0;

  // Employee info
  employeeName: string = '';
  employeePosition: string = '';
  employeeEmail: string = '';
  employeeDepartment: string = '';
  employeeManager: string = '';
  employeeJoinDate: string = '';
  scoreCardId: number = 0;

  // Score cards
  activeScoreCard: ScoreCard | null = null;
  pastScoreCards: ScoreCard[] = [];
  goalsWeightage: number = 60;
  competenciesWeightage: number = 25;
  valuesWeightage: number = 15;
  goals: any[] = [];
  competencies: any[] = [];
  values: any[] = [];

  // Review Period Selection
  selectedReviewPeriod: string = 'Q1 2025';
  availableReviewPeriods: string[] = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'];

  // Modals
  showCreateScoreCardModal: boolean = false;
  showAddGoalModal: boolean = false;
  showStartProcessModal: boolean = false;
  processFormActiveTab: string = 'goals';

  // Library Goals
  selectedLibraryGoal: string = '';
  libraryGoals: any[] = [];
  isLoadingLibraryGoals = false;
  private goalsLibraryService = inject(GoalsLibraryService);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5003/api';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.employeeId = +params['id'];
      this.loadEmployeeData();
    });
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 0;
      this.scoreCardId = +params['scoreCardId'] || 0;
      if (this.employeeId) {
        this.loadScoreCards();
      }
    });
  }

  loadEmployeeData() {
    const token = localStorage.getItem('token');
    if (!token || !this.employeeId) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/employees/${this.employeeId}`, { headers }).subscribe({
      next: (employee: any) => {
        console.log('Employee data:', employee);
        this.employeeName = employee.full_name || '';
        this.employeeEmail = employee.email || '';
        this.employeePosition = employee.position?.title || 'N/A';
        this.employeeDepartment = employee.department?.name || 'N/A';
        this.employeeManager = employee.reporting_manager?.full_name || 'N/A';
        this.employeeJoinDate = employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A';
      },
      error: (err) => {
        console.error('Failed to load employee data:', err);
      }
    });
  }

  loadScoreCards() {
    const token = localStorage.getItem('token');
    if (!token || !this.employeeId) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Helper function to set score card and load related data
    const setScoreCard = (sc: any) => {
      this.scoreCardId = sc.id;
      this.periodId = sc.review_period_id || this.periodId;
      this.activeScoreCard = {
        id: sc.id,
        reviewPeriod: sc.review_period?.period_name || 'N/A',
        status: sc.status || 'planning',
        startDate: sc.review_period?.start_date ? new Date(sc.review_period.start_date).toLocaleDateString() : '',
        endDate: sc.review_period?.end_date ? new Date(sc.review_period.end_date).toLocaleDateString() : ''
      };
      // Update weightage
      this.goalsWeightage = sc.goals_weightage || 60;
      this.competenciesWeightage = sc.competencies_weightage || 25;
      this.valuesWeightage = sc.values_weightage || 15;
      // Load goals, competencies, and values for this score card
      this.loadGoals();
      this.loadCompetencies();
      this.loadValues();
    };

    // If scoreCardId is provided, use it directly
    if (this.scoreCardId) {
      this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}`, { headers }).subscribe({
        next: (response: any) => {
          console.log('Score card loaded:', response);
          if (response.review_period || response.id) {
            setScoreCard(response);
          }
        },
        error: (err) => {
          console.error('Failed to load score card:', err);
        }
      });
    } else if (this.periodId) {
      // Get score card for this employee and period
      this.http.get(`${this.apiUrl}/score-cards?employee_id=${this.employeeId}&review_period_id=${this.periodId}`, { headers }).subscribe({
        next: (response: any) => {
          console.log('Score cards response:', response);
          const scoreCards = Array.isArray(response) ? response : [];
          if (scoreCards.length > 0) {
            setScoreCard(scoreCards[0]);
          } else {
            console.log('No score card found for employee', this.employeeId, 'period', this.periodId);
          }
        },
        error: (err) => {
          console.error('Failed to load score cards:', err);
        }
      });
    } else {
      // Try to find any active score card for this employee
      this.http.get(`${this.apiUrl}/score-cards?employee_id=${this.employeeId}`, { headers }).subscribe({
        next: (response: any) => {
          console.log('All score cards for employee:', response);
          const scoreCards = Array.isArray(response) ? response : [];
          if (scoreCards.length > 0) {
            // Get the most recent one (or active period)
            setScoreCard(scoreCards[0]);
          }
        },
        error: (err) => {
          console.error('Failed to load score cards:', err);
        }
      });
    }
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
    this.router.navigate(['/manager-evaluation-periods']);
  }

  backToEmployeeList() {
    this.router.navigate(['/manager-score-cards/list'], { queryParams: { periodId: this.periodId } });
  }

  viewScoreCardDetails(scoreCardId: number) {
    // Navigate to manager score card details
    this.router.navigate(['/manager-score-card-details'], {
      queryParams: {
        id: scoreCardId
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
    this.loadLibraryGoals();
    // Reset form
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
          reviewPeriod: this.activeScoreCard?.reviewPeriod || 'N/A',
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

  loadCompetencies() {
    if (!this.scoreCardId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/competencies`, { headers }).subscribe({
      next: (response: any) => {
        this.competencies = (response || []).map((comp: any) => ({
          id: comp.id,
          name: comp.competency_name || comp.name,
          description: comp.description || '',
          targetLevel: comp.target_level || '',
          minLevel: comp.min_proficiency_level || '',
          maxLevel: comp.max_proficiency_level || ''
        }));
      },
      error: (err) => {
        console.error('Failed to load competencies:', err);
        this.competencies = [];
      }
    });
  }

  loadValues() {
    if (!this.scoreCardId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}/values`, { headers }).subscribe({
      next: (response: any) => {
        this.values = (response || []).map((val: any) => ({
          id: val.id,
          name: val.value_name || val.name,
          description: val.description || ''
        }));
      },
      error: (err) => {
        console.error('Failed to load values:', err);
        this.values = [];
      }
    });
  }

  closeAddGoalModal() {
    this.showAddGoalModal = false;
  }

  addGoal() {
    // Validate required fields
    if (!this.newGoal.name || !this.newGoal.weight) {
      alert('Please fill in goal name and weight');
      return;
    }

    const scoreCardIdToUse = this.scoreCardId || this.activeScoreCard?.id;
    if (!scoreCardIdToUse) {
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
      weight: this.newGoal.weight
    };

    if (this.selectedLibraryGoal) {
      payload.library_goal_id = parseInt(this.selectedLibraryGoal);
    }

    if (this.newGoal.startDate) payload.start_date = this.newGoal.startDate;
    if (this.newGoal.endDate) payload.end_date = this.newGoal.endDate;
    if (this.newGoal.deadlineDate) payload.deadline_date = this.newGoal.deadlineDate;
    if (this.newGoal.status) payload.status = this.newGoal.status;

    this.http.post(`${this.apiUrl}/score-cards/${scoreCardIdToUse}/goals`, payload, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Goal added successfully!');
          this.closeAddGoalModal();
        },
        error: (err) => {
          console.error('Error adding goal:', err);
          alert(err.error?.error || 'Failed to add goal. Please try again.');
        }
      });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        event.target.value = '';
        return;
      }
      this.newGoal.performanceDocuments = file;
      console.log('File selected:', file.name);
    }
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

