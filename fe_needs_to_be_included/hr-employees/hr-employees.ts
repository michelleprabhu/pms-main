import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Employee {
  id: string;
  fullName: string;
  position: string;
  department: string;
  manager: string | null;
  joiningDate: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-hr-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-employees.html',
  styleUrls: ['./hr-employees.css']
})
export class HrEmployeesComponent {
  isSidebarCollapsed = false;
  activeTab: 'all' | 'active' | 'inactive' = 'all';

  allEmployees: Employee[] = [
    { id: 'EMP001', fullName: 'John Smith', position: 'Senior Manager', department: 'Sales', manager: null, joiningDate: '2020-01-15', status: 'Active' },
    { id: 'EMP002', fullName: 'Sarah Johnson', position: 'Developer', department: 'IT', manager: 'John Smith', joiningDate: '2021-03-20', status: 'Active' },
    { id: 'EMP003', fullName: 'Anna Lee', position: 'HR Specialist', department: 'HR', manager: 'John Smith', joiningDate: '2019-11-10', status: 'Active' },
    { id: 'EMP004', fullName: 'Mike Brown', position: 'Account Manager', department: 'Sales', manager: 'John Smith', joiningDate: '2020-07-05', status: 'Active' },
    { id: 'EMP005', fullName: 'David Wilson', position: 'QA Analyst', department: 'IT', manager: 'Sarah Johnson', joiningDate: '2021-08-15', status: 'Active' },
    { id: 'EMP006', fullName: 'Emily Davis', position: 'Designer', department: 'IT', manager: 'Sarah Johnson', joiningDate: '2022-01-10', status: 'Active' },
    { id: 'EMP007', fullName: 'Robert Taylor', position: 'Sales Executive', department: 'Sales', manager: 'Mike Brown', joiningDate: '2021-05-20', status: 'Active' },
    { id: 'EMP008', fullName: 'Maria Garcia', position: 'Operations Manager', department: 'Operations', manager: null, joiningDate: '2019-09-01', status: 'Active' },
    { id: 'EMP009', fullName: 'James Anderson', position: 'Developer', department: 'IT', manager: 'Sarah Johnson', joiningDate: '2022-04-15', status: 'Active' },
    { id: 'EMP010', fullName: 'Jennifer Martinez', position: 'Sales Executive', department: 'Sales', manager: 'Mike Brown', joiningDate: '2020-12-01', status: 'Inactive' },
    { id: 'EMP011', fullName: 'William Rodriguez', position: 'HR Specialist', department: 'HR', manager: 'Anna Lee', joiningDate: '2021-02-28', status: 'Inactive' },
    { id: 'EMP012', fullName: 'Lisa Thompson', position: 'QA Analyst', department: 'IT', manager: 'Sarah Johnson', joiningDate: '2019-06-15', status: 'Inactive' }
  ];

  constructor(private router: Router) {}

  get filteredEmployees(): Employee[] {
    if (this.activeTab === 'all') {
      return this.allEmployees;
    } else if (this.activeTab === 'active') {
      return this.allEmployees.filter(emp => emp.status === 'Active');
    } else {
      return this.allEmployees.filter(emp => emp.status === 'Inactive');
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
    this.router.navigate(['/hr/reports']);
  }

  navigateToManagement() {
    this.router.navigate(['/hr/management']);
  }

  navigateToReviewPeriod() {
    this.router.navigate(['/review-period']);
  }

  addEmployee() {
    this.router.navigate(['/hr/employees/add']);
  }

  viewEmployee(id: string) {
    this.router.navigate(['/hr/employees/view', id]);
  }

  editEmployee(id: string) {
    this.router.navigate(['/hr/employees/edit', id]);
  }

  deleteEmployee(id: string) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.allEmployees = this.allEmployees.filter(emp => emp.id !== id);
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}










