import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Goal {
  id: number;
  name: string;
  weight: number;
  employeeComments: string;
  employeeRating: number | null;
  managerComments: string;
  managerRating: number | null;
  hrComments: string;
  hrRating: number | null;
}

interface Competency {
  id: number;
  name: string;
  description: string;
  minProficiency: string;
  maxProficiency: string;
  employeeComments: string;
  employeeRating: number | null;
  managerComments: string;
  managerRating: number | null;
  hrComments: string;
  hrRating: number | null;
}

interface Value {
  id: number;
  name: string;
  employeeComments: string;
  employeeRating: number | null;
  managerComments: string;
  managerRating: number | null;
  hrComments: string;
  hrRating: number | null;
}

@Component({
  selector: 'app-evaluation-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation-details.html',
  styleUrls: ['./evaluation-details.css']
})
export class EvaluationDetailsComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'goals';
  employeeId: number = 1;

  employeeInfo = {
    name: 'John Doe',
    reviewPeriod: 'Q4 2024',
    status: 'Evaluation Complete'
  };

  goals: Goal[] = [
    { id: 1, name: 'Complete Q4 Sales Target', weight: 30, employeeComments: 'Achieved 95% of target. Market conditions were challenging.', employeeRating: 4, managerComments: 'Good effort despite market challenges. Nearly met the target.', managerRating: 3.5, hrComments: '', hrRating: null },
    { id: 2, name: 'Develop New Client Relationships', weight: 25, employeeComments: 'Successfully onboarded 5 new clients this quarter.', employeeRating: 5, managerComments: 'Exceeded expectations. Excellent client engagement.', managerRating: 5, hrComments: '', hrRating: null },
    { id: 3, name: 'Improve Team Collaboration', weight: 20, employeeComments: 'Led 3 cross-functional projects successfully.', employeeRating: 4.5, managerComments: 'Great team player. Enhanced overall team productivity.', managerRating: 4, hrComments: '', hrRating: null },
    { id: 4, name: 'Complete Product Training', weight: 15, employeeComments: 'Completed all required training modules ahead of schedule.', employeeRating: 5, managerComments: 'Proactive approach to learning. Well done.', managerRating: 4.5, hrComments: '', hrRating: null },
    { id: 5, name: 'Reduce Customer Complaints', weight: 10, employeeComments: 'Reduced complaints by 30% through better service protocols.', employeeRating: 4, managerComments: 'Excellent improvement in customer satisfaction scores.', managerRating: 4.5, hrComments: '', hrRating: null }
  ];

  competencies: Competency[] = [
    { id: 1, name: 'Communication', description: 'Effective verbal and written communication', minProficiency: 'Basic', maxProficiency: 'Expert', employeeComments: 'Improved presentation skills through workshops.', employeeRating: 4, managerComments: 'Clear and concise communicator. Well received by clients.', managerRating: 4.5, hrComments: '', hrRating: null },
    { id: 2, name: 'Leadership', description: 'Ability to guide and motivate team members', minProficiency: 'Intermediate', maxProficiency: 'Expert', employeeComments: 'Led team through challenging project deadlines.', employeeRating: 4.5, managerComments: 'Emerging leader. Shows promise in team management.', managerRating: 4, hrComments: '', hrRating: null },
    { id: 3, name: 'Problem Solving', description: 'Analytical thinking and solution development', minProficiency: 'Basic', maxProficiency: 'Advanced', employeeComments: 'Resolved multiple complex client issues independently.', employeeRating: 5, managerComments: 'Strong analytical skills. Quick problem resolution.', managerRating: 4.5, hrComments: '', hrRating: null },
    { id: 4, name: 'Technical Skills', description: 'Proficiency in relevant tools and technologies', minProficiency: 'Intermediate', maxProficiency: 'Expert', employeeComments: 'Learned new CRM system and trained others.', employeeRating: 4, managerComments: 'Quick learner. Helps others with technical challenges.', managerRating: 4, hrComments: '', hrRating: null }
  ];

  values: Value[] = [
    { id: 1, name: 'Integrity', employeeComments: 'Maintained ethical standards in all client interactions.', employeeRating: 5, managerComments: 'Consistently demonstrates honesty and trustworthiness.', managerRating: 5, hrComments: '', hrRating: null },
    { id: 2, name: 'Innovation', employeeComments: 'Proposed new process improvements adopted by team.', employeeRating: 4, managerComments: 'Creative thinker. Brings fresh perspectives.', managerRating: 4.5, hrComments: '', hrRating: null },
    { id: 3, name: 'Customer Focus', employeeComments: 'Always prioritizes customer needs and satisfaction.', employeeRating: 4.5, managerComments: 'Excellent customer service mindset.', managerRating: 4.5, hrComments: '', hrRating: null },
    { id: 4, name: 'Accountability', employeeComments: 'Takes ownership of responsibilities and outcomes.', employeeRating: 4, managerComments: 'Reliable and responsible. Delivers on commitments.', managerRating: 4, hrComments: '', hrRating: null }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.employeeId = +params['id'];
        // In a real app, you would fetch the employee data based on the ID
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/hr-dashboard']);
  }

  navigateToReviewPeriods() {
    this.router.navigate(['/review-period']);
  }

  navigateToPlanning() {
    this.router.navigate(['/planning']);
  }

  navigateToScoreCards() {
    this.router.navigate(['/score-cards']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/evaluation']);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  calculateAverageRating(items: (Goal | Competency | Value)[]): string {
    const ratings = items.filter(item => item.hrRating !== null).map(item => item.hrRating!);
    if (ratings.length === 0) return 'N/A';
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return average.toFixed(2);
  }

  getTotalWeight(): number {
    return this.goals.reduce((sum, goal) => sum + goal.weight, 0);
  }

  getWeightedAverageRating(): string {
    const weightedSum = this.goals
      .filter(goal => goal.hrRating !== null)
      .reduce((sum, goal) => sum + (goal.hrRating! * goal.weight), 0);
    
    const totalWeight = this.goals
      .filter(goal => goal.hrRating !== null)
      .reduce((sum, goal) => sum + goal.weight, 0);
    
    if (totalWeight === 0) return 'N/A';
    return (weightedSum / totalWeight).toFixed(2);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

