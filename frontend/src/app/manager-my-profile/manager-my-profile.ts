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
  employeeName: string = 'Michael Chen';
  employeePosition: string = 'Engineering Manager';
  employeeEmail: string = 'michael.chen@company.com';
  employeeDepartment: string = 'Engineering';
  employeeManager: string = 'VP Engineering';
  employeeJoinDate: string = 'Mar 10, 2018';

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
  libraryGoals = [
    { id: '1', name: 'Improve Customer Satisfaction Score', description: 'Increase CSAT score by implementing feedback mechanisms and improving response times', weight: 20 },
    { id: '2', name: 'Increase Revenue by Target Percentage', description: 'Achieve revenue growth targets through strategic initiatives and market expansion', weight: 25 },
    { id: '3', name: 'Reduce Operational Costs', description: 'Optimize processes and reduce unnecessary expenses to improve operational efficiency', weight: 15 },
    { id: '4', name: 'Enhance Team Productivity', description: 'Improve team output and efficiency through better tools, training, and collaboration', weight: 20 },
    { id: '5', name: 'Complete Strategic Project Deliverables', description: 'Successfully deliver all assigned strategic project milestones on time and within budget', weight: 20 },
    { id: '6', name: 'Complete Technical Certification', description: 'Obtain relevant technical certification to enhance skills and expertise in core technologies', weight: 15 },
    { id: '7', name: 'Implement New Software Feature', description: 'Design, develop, and deploy a new software feature that enhances product capabilities', weight: 25 }
  ];
  
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
      const goal = this.libraryGoals.find(g => g.id === this.selectedLibraryGoal);
      if (goal) {
        this.newGoal.name = goal.name;
        this.newGoal.description = goal.description;
        this.newGoal.weight = goal.weight;
      }
    }
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






