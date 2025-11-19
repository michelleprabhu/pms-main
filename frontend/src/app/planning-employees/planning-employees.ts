import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  scoreCardStatus: string;
}

@Component({
  selector: 'app-planning-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning-employees.html',
  styleUrls: ['./planning-employees.css']
})
export class PlanningEmployeesComponent implements OnInit {
  isSidebarCollapsed = false;
  periodId: number = 0;
  periodName: string = 'Q1 2025';
  searchTerm: string = '';

  employees: Employee[] = [
    { id: 1, name: 'John Doe', department: 'Engineering', position: 'Senior Software Engineer', scoreCardStatus: 'Plan Started' },
    { id: 2, name: 'Jane Smith', department: 'Engineering', position: 'Product Manager', scoreCardStatus: 'Plan Not Started' },
    { id: 3, name: 'Mike Johnson', department: 'Sales', position: 'Sales Manager', scoreCardStatus: 'Pending Employee Acceptance' },
    { id: 4, name: 'Sarah Williams', department: 'Marketing', position: 'Marketing Director', scoreCardStatus: 'Plan Finalized' },
    { id: 5, name: 'David Brown', department: 'Engineering', position: 'Tech Lead', scoreCardStatus: 'Plan Started' },
    { id: 6, name: 'Emily Davis', department: 'HR', position: 'HR Manager', scoreCardStatus: 'Planning in Progress' },
    { id: 7, name: 'Robert Miller', department: 'Finance', position: 'Financial Analyst', scoreCardStatus: 'Plan Started' },
    { id: 8, name: 'Lisa Anderson', department: 'Operations', position: 'Operations Manager', scoreCardStatus: 'Pending Employee Acceptance' }
  ];

  filteredEmployees: Employee[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.periodId = +params['periodId'] || 1;
      // In a real app, fetch period details and employees based on periodId
      this.filteredEmployees = [...this.employees];
    });
  }

  filterEmployees() {
    if (!this.searchTerm.trim()) {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(emp =>
        emp.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
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

  navigateToEvaluation() {
    this.router.navigate(['/evaluation-periods']);
  }

  navigateToReviewPeriods() {
    this.router.navigate(['/review-period']);
  }

  backToPlanning() {
    this.router.navigate(['/planning']);
  }

  viewEmployeeDetail(employeeId: number) {
    this.router.navigate(['/planning/employee-detail', employeeId], { queryParams: { periodId: this.periodId } });
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
      default:
        return '';
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

