import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PermissionService } from '../../services/permission.service';

interface ReviewPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  employeeCount: number;
}

interface EligibilityProfile {
  id: number;
  name: string;
  description: string;
  department: string;
  positionCriteria: string;
  goalsWeightage: number;
  competenciesWeightage: number;
  valuesWeightage: number;
  matchingEmployees: number;
  selected?: boolean;
}

interface GeneratedEmployee {
  name: string;
  department: string;
  position: string;
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.html',
  styleUrls: ['./planning.css']
})
export class PlanningComponent implements OnInit {
  isSidebarCollapsed = false;
  showStartPlanningModal = false;
  showSuccessPopup = false;
  showGeneratedEmployees = false;
  isGenerating = false;
  selectedPeriod: ReviewPeriod | null = null;
  totalWeightage = 100;
  selectedProfileIds: number[] = [];
  reviewPeriodId: number = 2; // Default to review period ID 2

  weightageConfig = {
    goals: 60,
    competencies: 25,
    values: 15
  };

  generatedEmployees: GeneratedEmployee[] = [];
  private apiUrl = 'http://localhost:5002/api';

  activeReviewPeriods: ReviewPeriod[] = [];

  completedReviewPeriods: ReviewPeriod[] = [
    { id: 3, name: 'Q3 2024', startDate: 'Jul 1, 2024', endDate: 'Sep 30, 2024', status: 'Completed', employeeCount: 248 },
    { id: 4, name: 'Q2 2024', startDate: 'Apr 1, 2024', endDate: 'Jun 30, 2024', status: 'Completed', employeeCount: 240 },
    { id: 5, name: 'Q1 2024', startDate: 'Jan 1, 2024', endDate: 'Mar 31, 2024', status: 'Completed', employeeCount: 235 },
    { id: 6, name: 'Annual 2023', startDate: 'Jan 1, 2023', endDate: 'Dec 31, 2023', status: 'Completed', employeeCount: 220 }
  ];

  eligibilityProfiles: EligibilityProfile[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.loadEligibilityProfiles();
    this.loadActiveReviewPeriods();
  }

  loadActiveReviewPeriods() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>(`${this.apiUrl}/review-periods/active`, { headers }).subscribe({
      next: (data) => {
        this.activeReviewPeriods = data;
        console.log('Loaded active review periods:', data);
      },
      error: (err) => {
        console.error('Failed to load active review periods', err);
      }
    });
  }

  loadEligibilityProfiles() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>(`${this.apiUrl}/eligibility-profiles`, { headers }).subscribe({
      next: (data) => {
        this.eligibilityProfiles = data.map(profile => ({
          id: profile.id,
          name: profile.profile_name,
          description: profile.description,
          department: profile.department,
          positionCriteria: profile.position_criteria,
      goalsWeightage: 60,
      competenciesWeightage: 25,
      valuesWeightage: 15,
          matchingEmployees: profile.matching_employees,
      selected: false
        }));
      },
      error: (err) => {
        console.error('Failed to load eligibility profiles', err);
        alert('Failed to load eligibility profiles. Please try again.');
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
    this.router.navigate(['/evaluation-periods']);
  }

  navigateToReports() {
    this.router.navigate(['/hr-reports']);
  }

  navigateToManagement() {
    this.router.navigate(['/hr-management']);
  }

  navigateToEligibilityProfiles() {
    this.router.navigate(['/planning/eligibility-profiles']);
  }

  viewPlanningEmployees(periodId: number) {
    this.router.navigate(['/planning/employees'], { queryParams: { periodId: periodId } });
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  onProfileSelect(profileId: number, isChecked: boolean) {
    console.log('onProfileSelect called:', { profileId, isChecked });
    if (isChecked) {
      if (!this.selectedProfileIds.includes(profileId)) {
        this.selectedProfileIds.push(profileId);
      }
    } else {
      this.selectedProfileIds = this.selectedProfileIds.filter(id => id !== profileId);
    }
    console.log('Updated selectedProfileIds:', this.selectedProfileIds);
  }

  // Modal methods
  openStartPlanningModal(period: ReviewPeriod) {
    this.selectedPeriod = period;
    this.reviewPeriodId = period.id;
    this.showStartPlanningModal = true;
    // Reset selections
    this.eligibilityProfiles.forEach(p => p.selected = false);
    this.selectedProfileIds = [];
    this.weightageConfig = { goals: 60, competencies: 25, values: 15 };
    this.calculateTotal();
  }

  closeStartPlanningModal() {
    this.showStartPlanningModal = false;
    this.selectedPeriod = null;
  }

  toggleProfileSelection(profile: EligibilityProfile) {
    profile.selected = !profile.selected;
    // Update selectedProfileIds array
    this.onProfileSelect(profile.id, profile.selected);
  }

  calculateTotal() {
    this.totalWeightage = 
      Number(this.weightageConfig.goals) + 
      Number(this.weightageConfig.competencies) + 
      Number(this.weightageConfig.values);
  }

  getSelectedProfilesCount(): number {
    return this.eligibilityProfiles.filter(p => p.selected).length;
  }

  getTotalEmployees(): number {
    return this.eligibilityProfiles
      .filter(p => p.selected)
      .reduce((total, profile) => total + profile.matchingEmployees, 0);
  }

  generateScoreCards() {
    if (this.getSelectedProfilesCount() === 0) {
      alert('Please select at least one profile');
      return;
    }

    this.isGenerating = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      review_period_id: this.reviewPeriodId,
      profile_ids: this.selectedProfileIds
    };

    console.log('Generating score cards with payload:', payload);
    console.log('Selected profile IDs:', this.selectedProfileIds);

    this.http.post<any>(`${this.apiUrl}/planning/generate-score-cards`, payload, { headers }).subscribe({
      next: (response) => {
      this.isGenerating = false;
      this.closeStartPlanningModal();
      
        // Map response employees to GeneratedEmployee format
        this.generatedEmployees = response.employees.map((emp: any) => ({
          name: emp.name,
          department: emp.department,
          position: emp.position
        }));
        
        // Show generated employees modal
      this.showGeneratedEmployees = true;
      },
      error: (err) => {
        this.isGenerating = false;
        console.error('Failed to generate score cards', err);
        alert('Error generating score cards. Please try again.');
      }
    });
  }

  generateMockEmployees(): GeneratedEmployee[] {
    const mockEmployees: GeneratedEmployee[] = [
      { name: 'John Doe', department: 'Engineering', position: 'Senior Software Engineer' },
      { name: 'Jane Smith', department: 'Engineering', position: 'Product Manager' },
      { name: 'Mike Johnson', department: 'Sales', position: 'Sales Manager' },
      { name: 'Sarah Williams', department: 'HR', position: 'HR Manager' },
      { name: 'Robert Brown', department: 'Engineering', position: 'Software Engineer' },
      { name: 'Emily Davis', department: 'Marketing', position: 'Marketing Director' },
      { name: 'James Wilson', department: 'Finance', position: 'Financial Analyst' },
      { name: 'Linda Martinez', department: 'Operations', position: 'Operations Manager' },
      { name: 'David Garcia', department: 'Engineering', position: 'Tech Lead' },
      { name: 'Jennifer Lopez', department: 'Sales', position: 'Account Executive' },
      { name: 'William Taylor', department: 'Engineering', position: 'DevOps Engineer' },
      { name: 'Elizabeth Anderson', department: 'Marketing', position: 'Content Manager' }
    ];
    
    return mockEmployees.slice(0, this.getTotalEmployees());
  }

  closeSuccessPopup() {
    this.showSuccessPopup = false;
  }

  closeGeneratedEmployees() {
    this.showGeneratedEmployees = false;
    this.generatedEmployees = [];
  }

  startScoreCardProcess() {
    this.showGeneratedEmployees = false;
    this.generatedEmployees = [];
    // Use the actual reviewPeriodId that was used to generate score cards
    this.router.navigate(['/score-cards/list'], { queryParams: { periodId: this.reviewPeriodId } });
  }
}

