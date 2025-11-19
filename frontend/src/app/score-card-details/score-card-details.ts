import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  
  goals: Goal[] = [
    {
      id: 1,
      name: 'Increase Sales Revenue',
      description: 'Achieve 20% growth in quarterly sales',
      successCriteria: 'Revenue increases by $500K and meets or exceeds 20% growth target with documented customer acquisitions',
      status: 'In Progress',
      weight: 30,
      reviewPeriod: 'Q1 2025',
      startDate: 'Jan 1, 2025',
      endDate: 'Mar 31, 2025',
      addedBy: 'HR'
    },
    {
      id: 2,
      name: 'Improve Customer Satisfaction',
      description: 'Increase CSAT score to 4.5/5',
      successCriteria: 'CSAT survey results show consistent scores of 4.5 or higher across all customer touchpoints for 3 consecutive months',
      status: 'In Progress',
      weight: 25,
      reviewPeriod: 'Q1 2025',
      startDate: 'Jan 1, 2025',
      endDate: 'Mar 31, 2025',
      addedBy: 'HR'
    },
    {
      id: 3,
      name: 'Complete Product Launch',
      description: 'Successfully launch new product line',
      successCriteria: 'Product is live in production, all features are functional, user documentation is published, and 100+ active users within first month',
      status: 'Not Started',
      weight: 20,
      reviewPeriod: 'Q1 2025',
      startDate: 'Feb 1, 2025',
      endDate: 'Mar 31, 2025',
      addedBy: 'HR'
    },
    {
      id: 4,
      name: 'Team Development',
      description: 'Conduct training sessions for team members',
      successCriteria: 'Complete 8 training sessions with 90%+ attendance and positive feedback scores above 4/5 from participants',
      status: 'In Progress',
      weight: 15,
      reviewPeriod: 'Q1 2025',
      startDate: 'Jan 15, 2025',
      endDate: 'Mar 15, 2025',
      addedBy: 'Manager'
    },
    {
      id: 5,
      name: 'Process Improvement',
      description: 'Streamline workflow processes',
      successCriteria: 'Process efficiency improved by 25%, documented procedures created, and team adoption rate of 80% or higher',
      status: 'Completed',
      weight: 10,
      reviewPeriod: 'Q1 2025',
      startDate: 'Jan 1, 2025',
      endDate: 'Feb 28, 2025',
      addedBy: 'Employee'
    }
  ];

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

  constructor(private router: Router, private route: ActivatedRoute) {
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
      
      // In a real app, fetch score card data based on this.scoreCardId
      // For now, we'll use mock data
      if (this.scoreCardId === 1) {
        this.scoreCard = {
          employeeName: 'John Doe',
          reviewPeriod: reviewPeriod,
          status: 'Pending Employee Acceptance'
        };
      } else if (this.scoreCardId === 2) {
        // Jane Smith - blank score card
        this.goals = [];
        this.scoreCard = {
          employeeName: 'Jane Smith',
          reviewPeriod: reviewPeriod,
          status: 'Plan Not Started'
        };
      } else if (this.scoreCardId === 3) {
        // Blank score card with no goals
        this.goals = [];
        this.scoreCard = {
          employeeName: 'John Doe',
          reviewPeriod: reviewPeriod,
          status: 'Plan Started'
        };
      } else {
        // For completed score cards, mark all goals as completed
        this.goals.forEach(goal => {
          goal.status = 'Completed';
        });
        this.scoreCard = {
          employeeName: 'John Doe',
          reviewPeriod: reviewPeriod,
          status: 'Evaluation Complete'
        };
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
    return this.getTotalWeight() === 100;
  }

  sendForEmployeeAcceptance() {
    if (this.canSendForAcceptance()) {
      if (this.scoreCard) {
        this.scoreCard.status = 'Pending Employee Acceptance';
        console.log('Sent for employee acceptance');
        // In a real app, save to backend
      }
    }
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

