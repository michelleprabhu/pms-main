import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Goal {
  id: number;
  name: string;
  type: string;
  weight: number;
  employeeComments: string;
  employeeRating: number;
  managerComments: string;
  managerRating: number;
  hrComments: string;
  hrRating: number;
}

interface Competency {
  id: number;
  name: string;
  description: string;
  minProficiency: string;
  maxProficiency: string;
  employeeComments: string;
  employeeRating: number;
  managerComments: string;
  managerRating: number;
  hrComments: string;
  hrRating: number;
}

interface Value {
  id: number;
  name: string;
  employeeComments: string;
  employeeRating: number;
  managerComments: string;
  managerRating: number;
  hrComments: string;
  hrRating: number;
}

@Component({
  selector: 'app-employee-ratings-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-ratings-details.html',
  styleUrls: ['./employee-ratings-details.css']
})
export class EmployeeRatingsDetailsComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: string = 'goals';
  employeeName = 'Sarah Johnson';
  reviewPeriodId: number = 1;

  reviewPeriodInfo = {
    name: 'Q4 2024',
    startDate: 'Oct 1, 2024',
    endDate: 'Dec 31, 2024',
    status: 'Completed'
  };

  goals: Goal[] = [
    { id: 1, name: 'Complete Q4 Sales Target', type: 'Personal Goal', weight: 30, 
      employeeComments: 'Achieved 95% of target. Market conditions were challenging.', employeeRating: 4,
      managerComments: 'Good effort despite market challenges. Nearly met the target.', managerRating: 3.5,
      hrComments: 'Strong performance in difficult market conditions.', hrRating: 4 },
    { id: 2, name: 'Develop New Client Relationships', type: 'Personal Goal', weight: 25,
      employeeComments: 'Successfully onboarded 5 new clients this quarter.', employeeRating: 5,
      managerComments: 'Exceeded expectations. Excellent client engagement.', managerRating: 5,
      hrComments: 'Outstanding client acquisition results.', hrRating: 5 },
    { id: 3, name: 'Improve Team Collaboration', type: 'Development Goal', weight: 20,
      employeeComments: 'Led 3 cross-functional projects successfully.', employeeRating: 4.5,
      managerComments: 'Great team player. Enhanced overall team productivity.', managerRating: 4,
      hrComments: 'Demonstrated excellent leadership in team settings.', hrRating: 4.5 },
    { id: 4, name: 'Complete Product Training', type: 'Development Goal', weight: 15,
      employeeComments: 'Completed all required training modules ahead of schedule.', employeeRating: 5,
      managerComments: 'Proactive approach to learning. Well done.', managerRating: 4.5,
      hrComments: 'Exemplary dedication to professional development.', hrRating: 5 },
    { id: 5, name: 'Reduce Customer Complaints', type: 'Personal Goal', weight: 10,
      employeeComments: 'Reduced complaints by 30% through better service protocols.', employeeRating: 4,
      managerComments: 'Excellent improvement in customer satisfaction scores.', managerRating: 4.5,
      hrComments: 'Significant positive impact on customer experience.', hrRating: 4 }
  ];

  competencies: Competency[] = [
    { id: 1, name: 'Communication', description: 'Effective verbal and written communication', 
      minProficiency: 'Basic', maxProficiency: 'Expert',
      employeeComments: 'Improved presentation skills through workshops.', employeeRating: 4,
      managerComments: 'Clear and concise communicator. Well received by clients.', managerRating: 4.5,
      hrComments: 'Strong communication skills across all channels.', hrRating: 4 },
    { id: 2, name: 'Leadership', description: 'Ability to guide and motivate team members',
      minProficiency: 'Intermediate', maxProficiency: 'Expert',
      employeeComments: 'Led team through challenging project deadlines.', employeeRating: 4.5,
      managerComments: 'Emerging leader. Shows promise in team management.', managerRating: 4,
      hrComments: 'Demonstrated natural leadership abilities.', hrRating: 4.5 },
    { id: 3, name: 'Problem Solving', description: 'Analytical thinking and solution development',
      minProficiency: 'Basic', maxProficiency: 'Advanced',
      employeeComments: 'Resolved multiple complex client issues independently.', employeeRating: 5,
      managerComments: 'Strong analytical skills. Quick problem resolution.', managerRating: 4.5,
      hrComments: 'Excellent critical thinking and problem-solving.', hrRating: 5 },
    { id: 4, name: 'Technical Skills', description: 'Proficiency in relevant tools and technologies',
      minProficiency: 'Intermediate', maxProficiency: 'Expert',
      employeeComments: 'Learned new CRM system and trained others.', employeeRating: 4,
      managerComments: 'Quick learner. Helps others with technical challenges.', managerRating: 4,
      hrComments: 'Strong technical aptitude and willingness to share knowledge.', hrRating: 4 }
  ];

  values: Value[] = [
    { id: 1, name: 'Integrity',
      employeeComments: 'Maintained ethical standards in all client interactions.', employeeRating: 5,
      managerComments: 'Consistently demonstrates honesty and trustworthiness.', managerRating: 5,
      hrComments: 'Exemplifies company values in all actions.', hrRating: 5 },
    { id: 2, name: 'Innovation',
      employeeComments: 'Proposed new process improvements adopted by team.', employeeRating: 4,
      managerComments: 'Creative thinker. Brings fresh perspectives.', managerRating: 4.5,
      hrComments: 'Contributes innovative ideas regularly.', hrRating: 4 },
    { id: 3, name: 'Customer Focus',
      employeeComments: 'Always prioritizes customer needs and satisfaction.', employeeRating: 4.5,
      managerComments: 'Excellent customer service mindset.', managerRating: 4.5,
      hrComments: 'Consistently puts customers first.', hrRating: 4.5 },
    { id: 4, name: 'Accountability',
      employeeComments: 'Takes ownership of responsibilities and outcomes.', employeeRating: 4,
      managerComments: 'Reliable and responsible. Delivers on commitments.', managerRating: 4,
      hrComments: 'Demonstrates strong sense of accountability.', hrRating: 4 }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.reviewPeriodId = +params['id'] || 1;
      // In a real application, you would fetch ratings data based on this.reviewPeriodId
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getGoalsByType(type: string): Goal[] {
    return this.goals.filter(goal => goal.type === type);
  }

  getWeightedAverageRating(ratingType: 'employee' | 'manager' | 'hr'): string {
    let weightedSum = 0;
    let totalWeight = 0;

    this.goals.forEach(goal => {
      if (ratingType === 'employee') {
        weightedSum += goal.employeeRating * goal.weight;
      } else if (ratingType === 'manager') {
        weightedSum += goal.managerRating * goal.weight;
      } else if (ratingType === 'hr') {
        weightedSum += goal.hrRating * goal.weight;
      }
      totalWeight += goal.weight;
    });

    if (totalWeight === 0) return 'N/A';
    return (weightedSum / totalWeight).toFixed(2);
  }

  calculateAverageRating(items: (Competency | Value)[], ratingType: 'employee' | 'manager' | 'hr'): string {
    if (items.length === 0) return 'N/A';
    
    let totalRating = 0;
    items.forEach(item => {
      if (ratingType === 'employee') {
        totalRating += item.employeeRating;
      } else if (ratingType === 'manager') {
        totalRating += item.managerRating;
      } else if (ratingType === 'hr') {
        totalRating += item.hrRating;
      }
    });
    
    return (totalRating / items.length).toFixed(2);
  }

  navigateToDashboard() {
    this.router.navigate(['/employee-dashboard']);
  }

  navigateToSelfEvaluation() {
    this.router.navigate(['/employee-self-evaluation']);
  }

  navigateToRatings() {
    this.router.navigate(['/employee-ratings']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

