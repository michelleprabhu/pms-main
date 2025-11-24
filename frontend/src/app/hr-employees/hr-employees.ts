import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  position?: { title: string } | null;
  department?: { name: string } | null;
  reporting_manager?: { full_name: string } | null;
  joining_date: string;
  is_active: boolean;
  employment_status: string;
}

@Component({
  selector: 'app-hr-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-employees.html',
  styleUrls: ['./hr-employees.css']
})
export class HrEmployeesComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab: 'all' | 'active' | 'inactive' = 'all';
  allEmployees: Employee[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading = true;
    this.errorMessage = '';
    this.employeeService.getAllEmployees(true).subscribe({
      next: (employees: Employee[]) => {
        this.allEmployees = employees;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage = 'Failed to load employees. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get filteredEmployees(): Employee[] {
    if (this.activeTab === 'all') {
      return this.allEmployees;
    } else if (this.activeTab === 'active') {
      return this.allEmployees.filter(emp => emp.is_active && emp.employment_status === 'Active');
    } else {
      return this.allEmployees.filter(emp => !emp.is_active || emp.employment_status !== 'Active');
    }
  }

  setTab(tab: 'all' | 'active' | 'inactive') {
    this.activeTab = tab;
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

  navigateToReports() {
    this.router.navigate(['/hr-reports']);
  }

  navigateToManagement() {
    this.router.navigate(['/hr-management']);
  }

  navigateToReviewPeriod() {
    this.router.navigate(['/review-period']);
  }

  addEmployee() {
    this.router.navigate(['/hr-employees/add']);
  }

  viewEmployee(id: number) {
    this.router.navigate(['/hr-employees/view', id]);
  }

  editEmployee(id: number) {
    this.router.navigate(['/hr-employees/edit', id]);
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees(); // Reload list
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          alert('Failed to delete employee. Please try again.');
        }
      });
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}










