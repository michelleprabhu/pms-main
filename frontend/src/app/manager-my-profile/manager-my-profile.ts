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
  selector: 'app-manager-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-my-profile.html',
  styleUrls: ['./manager-my-profile.css']
})
export class ManagerMyProfileComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'scorecards'; // Default to Score Cards tab
  periodId: number = 0;

  // Manager info (showing manager as an employee)
  employeeName: string = '';
  employeePosition: string = '';
  employeeEmail: string = '';
  employeeDepartment: string = '';
  employeeManager: string = '';
  employeeJoinDate: string = '';

  // Weightage Distribution
  weightages = {
    goals: 60,
    competencies: 25,
    values: 15
  };

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
  selectedLibraryGoal: string = '';
  libraryGoals: any[] = [];
  isLoadingLibraryGoals = false;
  private goalsLibraryService = inject(GoalsLibraryService);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5003/api';
  
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
    this.loadUserData();
    this.loadScoreCards();
  }

  loadUserData() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/current-user/employee`, { headers }).subscribe({
      next: (employee: any) => {
        if (employee) {
          this.employeeName = employee.full_name || '';
          this.employeeEmail = employee.email || '';
          this.employeePosition = employee.position?.title || 'N/A';
          this.employeeDepartment = employee.department?.name || 'N/A';
          this.employeeManager = employee.reporting_manager?.full_name || 'N/A';
          this.employeeJoinDate = employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A';
        }
      },
      error: (err) => {
        console.error('Failed to load employee data:', err);
        // Fallback to current-user endpoint
        this.http.get(`${this.apiUrl}/current-user`, { headers }).subscribe({
          next: (user: any) => {
            if (user.employee) {
              this.employeeName = user.employee.full_name || user.username || '';
              this.employeeEmail = user.employee.email || user.email || '';
              this.employeePosition = user.employee.position?.title || 'N/A';
              this.employeeDepartment = user.employee.department?.name || 'N/A';
              this.employeeManager = user.employee.reporting_manager?.full_name || 'N/A';
              this.employeeJoinDate = user.employee.joining_date ? new Date(user.employee.joining_date).toLocaleDateString() : 'N/A';
            } else {
              this.employeeName = user.username || '';
              this.employeeEmail = user.email || '';
            }
          },
          error: (err2) => {
            console.error('Failed to load user data:', err2);
          }
        });
      }
    });
  }

  loadScoreCards() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Get current user's employee_id first
    this.http.get(`${this.apiUrl}/current-user`, { headers }).subscribe({
      next: (user: any) => {
        if (!user.employee_id) {
          console.warn('User has no employee_id');
          return;
        }

        // Get employee's score cards
        this.http.get(`${this.apiUrl}/score-cards/employee/my-score-cards`, { headers }).subscribe({
          next: (response: any) => {
            const scoreCards = response.score_cards || [];
            if (scoreCards.length > 0) {
              // Find active score card
              const active = scoreCards.find((sc: any) => sc.status === 'planning' || sc.status === 'in_progress');
              if (active) {
                this.activeScoreCard = {
                  id: active.id,
                  reviewPeriod: active.review_period?.period_name || 'N/A',
                  status: active.status || 'Planning in Progress',
                  startDate: active.review_period?.start_date ? new Date(active.review_period.start_date).toLocaleDateString() : '',
                  endDate: active.review_period?.end_date ? new Date(active.review_period.end_date).toLocaleDateString() : ''
                };
                
                // Load weightage
                if (active.goals_weightage) this.weightages.goals = active.goals_weightage;
                if (active.competencies_weightage) this.weightages.competencies = active.competencies_weightage;
                if (active.values_weightage) this.weightages.values = active.values_weightage;
              }
              
              // Past score cards
              this.pastScoreCards = scoreCards
                .filter((sc: any) => sc.status === 'completed' || sc.status === 'finalized')
                .map((sc: any) => ({
                  id: sc.id,
                  reviewPeriod: sc.review_period?.period_name || 'N/A',
                  status: 'Evaluation Complete',
                  startDate: sc.review_period?.start_date ? new Date(sc.review_period.start_date).toLocaleDateString() : '',
                  endDate: sc.review_period?.end_date ? new Date(sc.review_period.end_date).toLocaleDateString() : ''
                }));
            }
          },
          error: (err) => {
            console.error('Failed to load score cards:', err);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load user:', err);
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

  navigateToSelfEvaluation() {
    this.router.navigate(['/manager-self-evaluation']);
  }

  navigateToMyScoreCard() {
    this.router.navigate(['/manager-score-cards']);
  }

  navigateToRatings() {
    this.router.navigate(['/manager-ratings']);
  }

  backToReviewPeriods() {
    this.router.navigate(['/manager-score-cards']);
  }

  viewScoreCardDetails(scoreCardId: number) {
    // Navigate to manager score card details
    this.router.navigate(['/manager-score-card-details'], { 
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
        console.log('Loaded library goals:', goals);
        this.libraryGoals = Array.isArray(goals) ? goals : [];
        console.log('Library goals count:', this.libraryGoals.length);
        this.isLoadingLibraryGoals = false;
      },
      error: (err) => {
        console.error('Failed to load library goals:', err);
        console.error('Error details:', err.error);
        this.libraryGoals = [];
        this.isLoadingLibraryGoals = false;
      }
    });
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

  onLibraryGoalSelected() {
    if (this.selectedLibraryGoal) {
      const goal = this.libraryGoals.find(g => g.id === +this.selectedLibraryGoal);
      if (goal) {
        this.newGoal.name = goal.goal_name || goal.name;
        this.newGoal.description = goal.description || '';
        // Use suggested_weight if available, otherwise default to 0
        this.newGoal.weight = goal.suggested_weight ? parseInt(goal.suggested_weight) : 0;
      }
    } else {
      // Clear form when no library goal is selected
      this.newGoal.name = '';
      this.newGoal.description = '';
      this.newGoal.weight = 0;
    }
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.newGoal.performanceDocuments = event.target.files[0];
    }
  }

  addGoal() {
    // Validation
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

    // Prepare payload
    const payload: any = {
      goal_name: this.newGoal.name,
      description: this.newGoal.description || null,
      weight: this.newGoal.weight
    };

    // If library goal is selected, include library_goal_id
    if (this.selectedLibraryGoal) {
      payload.library_goal_id = parseInt(this.selectedLibraryGoal);
    }

    // Add optional fields
    if (this.newGoal.startDate) {
      payload.start_date = this.newGoal.startDate;
    }
    if (this.newGoal.endDate) {
      payload.end_date = this.newGoal.endDate;
    }
    if (this.newGoal.deadlineDate) {
      payload.deadline_date = this.newGoal.deadlineDate;
    }
    if (this.newGoal.status) {
      payload.status = this.newGoal.status;
    }

    // Call API
    this.http.post(`${this.apiUrl}/score-cards/${this.activeScoreCard.id}/goals`, payload, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Goal added successfully!');
          this.closeAddGoalModal();
          // Reload goals list if needed
          // You might want to emit an event or reload the score card data here
        },
        error: (err) => {
          console.error('Error adding goal:', err);
          alert(err.error?.error || 'Failed to add goal. Please try again.');
        }
      });
  }

  onWeightageChange(changedField: 'goals' | 'competencies' | 'values') {
    const total = this.weightages.goals + this.weightages.competencies + this.weightages.values;
    
    if (total !== 100) {
      const changedValue = this.weightages[changedField];
      const remaining = 100 - changedValue;
      
      const otherFields = Object.keys(this.weightages).filter(k => k !== changedField) as ('goals' | 'competencies' | 'values')[];
      const otherTotal = otherFields.reduce((sum, k) => sum + this.weightages[k], 0);
      
      if (otherTotal > 0) {
        otherFields.forEach(field => {
          const proportion = this.weightages[field] / otherTotal;
          this.weightages[field] = Math.round(remaining * proportion / 5) * 5;
        });
      }
    }
    
    console.log('Weightages auto-saved:', this.weightages);
  }

  getTotalWeightage(): number {
    return this.weightages.goals + this.weightages.competencies + this.weightages.values;
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}






