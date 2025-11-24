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
  scoreCardId: number = 0;
  employeeId: number = 0;

  // Employee info
  employeeName: string = 'Loading...';
  employeePosition: string = 'Loading...';
  employeeEmail: string = 'Loading...';
  employeeDepartment: string = 'Loading...';
  employeeManager: string = 'Loading...';
  employeeJoinDate: string = 'Loading...';

  // Score cards
  activeScoreCard: ScoreCard | null = null;
  pastScoreCards: ScoreCard[] = [];
  goals: any[] = [];
  competencies: any[] = [];
  values: any[] = [];

  // Add Goal Modal
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
    deadlineDate: '',
    updatedBy: '',
    performanceDocuments: null as File | null
  };
  private goalsLibraryService = inject(GoalsLibraryService);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5003/api';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 1;
      this.scoreCardId = +params['scoreCardId'] || 0;

      console.log('ngOnInit - periodId:', this.periodId, 'scoreCardId:', this.scoreCardId);

      // Load employee data first
      this.loadEmployeeData();

      // Load score card data if scoreCardId is provided
      if (this.scoreCardId) {
        this.loadScoreCardData();
      }
    });
  }

  loadEmployeeData() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      console.error('No authentication data found');
      this.employeeName = 'Error loading data';
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log('User object:', user);

      this.employeeId = user.employee_id;

      if (!this.employeeId) {
        console.error('No employee_id found in user data');
        this.employeeName = 'Error loading data';
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Fetch employee details
      this.http.get(`${this.apiUrl}/employees/${this.employeeId}`, { headers }).subscribe({
        next: (employee: any) => {
          console.log('Employee data loaded:', employee);
          this.employeeName = employee.full_name || 'N/A';
          this.employeeEmail = employee.email || 'N/A';
          this.employeeDepartment = employee.department?.name || 'N/A';
          this.employeePosition = employee.position?.title || 'N/A';
          this.employeeJoinDate = employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

          // Load manager name if reporting_manager_id exists
          if (employee.reporting_manager_id) {
            this.http.get(`${this.apiUrl}/employees/${employee.reporting_manager_id}`, { headers }).subscribe({
              next: (manager: any) => {
                this.employeeManager = manager.full_name || 'N/A';
              },
              error: (err) => {
                console.error('Failed to load manager data:', err);
                this.employeeManager = 'N/A';
              }
            });
          } else {
            this.employeeManager = 'N/A';
          }
        },
        error: (err) => {
          console.error('Failed to load employee data:', err);
          this.employeeName = 'Error loading data';
          this.employeeEmail = 'N/A';
          this.employeeDepartment = 'N/A';
          this.employeePosition = 'N/A';
          this.employeeManager = 'N/A';
          this.employeeJoinDate = 'N/A';
        }
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.employeeName = 'Error loading data';
    }
  }

  loadScoreCardData() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Load the specific score card
    this.http.get(`${this.apiUrl}/score-cards/${this.scoreCardId}`, { headers }).subscribe({
      next: (scoreCard: any) => {
        this.activeScoreCard = {
          id: scoreCard.id,
          reviewPeriod: scoreCard.review_period?.period_name || 'N/A',
          status: scoreCard.status || 'N/A',
          startDate: scoreCard.review_period?.start_date ? new Date(scoreCard.review_period.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
          endDate: scoreCard.review_period?.end_date ? new Date(scoreCard.review_period.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
        };
        // Load goals, competencies, and values
        this.loadGoals();
        this.loadCompetencies();
        this.loadValues();
      },
      error: (err) => {
        console.error('Failed to load score card:', err);
      }
    });

    // Load all score cards for this employee
    this.http.get(`${this.apiUrl}/score-cards?employee_id=${this.employeeId}`, { headers }).subscribe({
      next: (scoreCards: any) => {
        if (Array.isArray(scoreCards)) {
          this.pastScoreCards = scoreCards
            .filter((sc: any) => sc.id !== this.scoreCardId) // Exclude the active one
            .map((sc: any) => ({
              id: sc.id,
              reviewPeriod: sc.review_period?.period_name || 'N/A',
              status: sc.status || 'N/A',
              startDate: sc.review_period?.start_date ? new Date(sc.review_period.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
              endDate: sc.review_period?.end_date ? new Date(sc.review_period.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
            }));
        }
      },
      error: (err) => {
        console.error('Failed to load past score cards:', err);
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
        this.goals = (response.goals || []);
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
        this.competencies = response || [];
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
        this.values = response || [];
      },
      error: (err) => {
        console.error('Failed to load values:', err);
        this.values = [];
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
    this.loadLibraryGoals();
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
    this.selectedLibraryGoal = '';
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.newGoal.performanceDocuments = event.target.files[0];
    }
  }

  addGoal() {
    if (!this.newGoal.name || !this.newGoal.weight) {
      alert('Please fill in goal name and weight');
      return;
    }

    if (!this.activeScoreCard || !this.activeScoreCard.id) {
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

    this.http.post(`${this.apiUrl}/score-cards/${this.activeScoreCard.id}/goals`, payload, { headers })
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

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

