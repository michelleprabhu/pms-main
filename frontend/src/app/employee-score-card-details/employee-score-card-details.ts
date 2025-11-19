import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  employeeName = 'Sarah Johnson';
  scoreCard: ScoreCard | null = null;
  newComment: string = '';
  periodId: number = 1;
  
  planningComments: PlanningComment[] = [
    {
      id: 1,
      role: 'HR',
      text: 'Please ensure all goals are measurable and aligned with company objectives.',
      timestamp: new Date('2025-01-05T10:30:00')
    },
    {
      id: 2,
      role: 'Manager',
      text: 'I will add team collaboration goals by end of this week.',
      timestamp: new Date('2025-01-06T14:20:00')
    },
    {
      id: 3,
      role: 'Employee',
      text: 'Thank you! I will review and add my personal development goals by tomorrow.',
      timestamp: new Date('2025-01-07T09:15:00')
    }
  ];
  
  goals: Goal[] = [
    {
      id: 1,
      name: 'Increase Sales Revenue',
      description: 'Achieve 20% growth in quarterly sales',
      successCriteria: 'Revenue increases by $500K and meets or exceeds 20% growth target with documented customer acquisitions',
      status: 'In Progress',
      weight: 20,
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
      weight: 20,
      reviewPeriod: 'Q1 2025',
      startDate: 'Jan 1, 2025',
      endDate: 'Mar 31, 2025',
      addedBy: 'HR'
    },
    {
      id: 3,
      name: 'Complete Team Code Review Process',
      description: 'Implement and lead team code review sessions',
      successCriteria: 'Conduct weekly code reviews with documented feedback and track improvement metrics',
      status: 'In Progress',
      weight: 15,
      reviewPeriod: 'Q1 2025',
      startDate: 'Jan 1, 2025',
      endDate: 'Mar 31, 2025',
      addedBy: 'HR'
    },
    {
      id: 4,
      name: 'Mentor Junior Team Members',
      description: 'Provide guidance and support to junior developers',
      successCriteria: 'Conduct bi-weekly mentoring sessions and track progress of mentees',
      status: 'In Progress',
      weight: 15,
      reviewPeriod: 'Q1 2025',
      startDate: 'Jan 1, 2025',
      endDate: 'Mar 31, 2025',
      addedBy: 'Manager'
    },
    {
      id: 5,
      name: 'Learn New Technology Stack',
      description: 'Complete training on React and TypeScript',
      successCriteria: 'Build a demo project using React and TypeScript and present to team',
      status: 'Not Started',
      weight: 30,
      reviewPeriod: 'Q1 2025',
      startDate: 'Jan 15, 2025',
      endDate: 'Mar 31, 2025',
      addedBy: 'Employee'
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

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 1;
    });

    // Initialize with mock data
    this.scoreCard = {
      employeeName: 'Sarah Johnson',
      reviewPeriod: 'Q1 2025',
      createdOn: 'Jan 1, 2025',
      createdBy: 'HR Admin',
      status: 'Planning in Progress'
    };
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
    return this.scoreCard?.status?.includes('Plan') || this.scoreCard?.status?.includes('Planning') || false;
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
    console.log('Opening Add Goal modal for employee');
    alert('Add Goal modal would open here (implement modal in future iteration)');
  }

  addComment() {
    if (this.newComment.trim()) {
      const comment: PlanningComment = {
        id: this.planningComments.length + 1,
        role: 'Employee',
        text: this.newComment.trim(),
        timestamp: new Date()
      };
      this.planningComments.push(comment);
      this.newComment = '';
      console.log('Employee added comment:', comment);
    }
  }
}
