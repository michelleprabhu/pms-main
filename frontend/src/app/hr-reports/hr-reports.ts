import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface TopPerformer {
  name: string;
  department: string;
  position: string;
  rating: number;
  completion: number;
}

interface DepartmentProgress {
  department: string;
  totalEmployees: number;
  completed: number;
  pending: number;
  selfEvalDone: number;
  managerEvalDone: number;
}

interface DepartmentRating {
  department: string;
  rating: number;
}

@Component({
  selector: 'app-hr-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-reports.html',
  styleUrls: ['./hr-reports.css']
})
export class HrReportsComponent {
  isSidebarCollapsed = false;
  
  // Filters
  selectedDepartment = 'All Departments';
  selectedPeriod = 'Q1 2025';
  
  departments = ['All Departments', 'Sales', 'IT', 'HR', 'Operations', 'Finance'];
  periods = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'];

  // Metrics
  averageRating = '4.2';
  completionRate = 85;
  pendingReviews = 12;

  // Department ratings for bar chart
  departmentRatings: DepartmentRating[] = [
    { department: 'Sales', rating: 4.5 },
    { department: 'IT', rating: 4.0 },
    { department: 'HR', rating: 4.3 },
    { department: 'Operations', rating: 3.8 },
    { department: 'Finance', rating: 4.2 }
  ];

  // Top performers
  topPerformers: TopPerformer[] = [
    { name: 'John Smith', department: 'Sales', position: 'Senior Manager', rating: 4.9, completion: 100 },
    { name: 'Sarah Johnson', department: 'IT', position: 'Developer', rating: 4.8, completion: 100 },
    { name: 'Anna Lee', department: 'HR', position: 'HR Specialist', rating: 4.8, completion: 100 },
    { name: 'Mike Brown', department: 'Sales', position: 'Account Manager', rating: 4.7, completion: 100 },
    { name: 'David Wilson', department: 'IT', position: 'QA Analyst', rating: 4.7, completion: 100 },
    { name: 'Emily Davis', department: 'IT', position: 'Designer', rating: 4.6, completion: 100 },
    { name: 'Robert Taylor', department: 'Sales', position: 'Sales Executive', rating: 4.6, completion: 100 },
    { name: 'Maria Garcia', department: 'Operations', position: 'Operations Manager', rating: 4.5, completion: 100 },
    { name: 'James Anderson', department: 'IT', position: 'Developer', rating: 4.5, completion: 100 },
    { name: 'Lisa Wilson', department: 'Finance', position: 'Financial Analyst', rating: 4.5, completion: 100 }
  ];

  // Department progress
  departmentProgress: DepartmentProgress[] = [
    { department: 'Sales', totalEmployees: 25, completed: 22, pending: 3, selfEvalDone: 22, managerEvalDone: 20 },
    { department: 'IT', totalEmployees: 15, completed: 14, pending: 1, selfEvalDone: 14, managerEvalDone: 13 },
    { department: 'HR', totalEmployees: 5, completed: 5, pending: 0, selfEvalDone: 5, managerEvalDone: 5 },
    { department: 'Operations', totalEmployees: 30, completed: 25, pending: 5, selfEvalDone: 27, managerEvalDone: 24 },
    { department: 'Finance', totalEmployees: 8, completed: 7, pending: 1, selfEvalDone: 7, managerEvalDone: 7 }
  ];

  constructor(private router: Router) {}

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

  navigateToEvaluation() {
    this.router.navigate(['/evaluation-periods']);
  }

  navigateToReports() {
    this.router.navigate(['/hr-reports']);
  }

  navigateToManagement() {
    this.router.navigate(['/hr-management']);
  }

  navigateToReviewPeriod() {
    this.router.navigate(['/review-period']);
  }

  getBarWidth(rating: number): string {
    return (rating / 5 * 100) + '%';
  }

  exportPDF() {
    alert('PDF export functionality would be implemented here');
  }

  exportExcel() {
    alert('Excel export functionality would be implemented here');
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}









