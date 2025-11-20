import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  apiUrl = 'http://localhost:5002/api';
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

  planningComments: PlanningComment[] = [
    {
      id: 1,
      role: 'HR',
      text: 'Initial goals have been set. Please review and provide feedback.',
      timestamp: new Date('2025-01-05T10:00:00')
    },
    {
      id: 2,
      role: 'Manager',
      text: 'Added team development goal. Employee can add their own goals as well.',
      timestamp: new Date('2025-01-06T14:30:00')
    }
  ];

  competencies: Competency[] = [
    {
      name: 'Software Development',
      description: 'Proficiency in coding, debugging, and software design patterns',
      minLevel: 3,
      maxLevel: 5
    },
    {
      name: 'Code Review & Quality',
      description: 'Ability to conduct thorough code reviews and maintain code quality standards',
      minLevel: 3,
      maxLevel: 5
    },
    {
      name: 'System Design & Architecture',
      description: 'Design scalable and maintainable system architectures',
      minLevel: 3,
      maxLevel: 5
    },
    {
      name: 'DevOps & CI/CD',
      description: 'Knowledge of deployment pipelines, containerization, and cloud platforms',
      minLevel: 2,
      maxLevel: 5
    },
    {
      name: 'Database Management',
      description: 'Proficiency in SQL/NoSQL databases, query optimization, and data modeling',
      minLevel: 3,
      maxLevel: 5
    },
    {
      name: 'API Development',
      description: 'Design and implement RESTful APIs and microservices',
      minLevel: 3,
      maxLevel: 5
    },
    {
      name: 'Testing & QA',
      description: 'Unit testing, integration testing, and test automation',
      minLevel: 3,
      maxLevel: 5
    },
    {
      name: 'Version Control (Git)',
      description: 'Proficiency in Git workflows, branching strategies, and collaboration',
      minLevel: 4,
      maxLevel: 5
    },
    {
      name: 'Agile Methodologies',
      description: 'Understanding of Scrum, Kanban, and agile development practices',
      minLevel: 3,
      maxLevel: 5
    },
    {
      name: 'Problem Solving',
      description: 'Analytical thinking and debugging complex technical issues',
      minLevel: 4,
      maxLevel: 5
    },
    {
      name: 'Communication',
      description: 'Clear technical communication with team members and stakeholders',
      minLevel: 3,
      maxLevel: 5
    },
    {
      name: 'Leadership & Mentoring',
      description: 'Ability to mentor junior developers and lead technical initiatives',
      minLevel: 2,
      maxLevel: 5
    }
  ];

  values: Value[] = [
    {
      name: 'Integrity',
      description: 'Demonstrates honesty and strong moral principles'
    },
    {
      name: 'Innovation',
      description: 'Brings creative solutions and new ideas'
    },
    {
      name: 'Collaboration',
      description: 'Works well with team members and stakeholders'
    },
    {
      name: 'Customer Focus',
      description: 'Prioritizes customer needs and satisfaction'
    },
    {
      name: 'Accountability',
      description: 'Takes ownership of work and commitments'
    },
    {
      name: 'Continuous Learning',
      description: 'Actively seeks to improve skills and knowledge'
    }
  ];

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {
    // Set default score card if none provided
    this.scoreCard = {
      employeeName: 'John Doe',
      reviewPeriod: 'Q1 2025',
      status: 'Plan Started'
    };
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.scoreCardId = +params['id'] || 1;
      const reviewPeriod = params['reviewPeriod'] || 'Q1 2025';
      
      // Load goals from backend
      this.loadGoals();
      
      // Set default score card info
      this.scoreCard = {
        employeeName: 'John Doe',
        reviewPeriod: reviewPeriod,
        status: 'Plan Started'
      };
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
    const planningStatuses = ['Plan Started', 'Planning in Progress', 'Pending Employee Acceptance'];
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

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

