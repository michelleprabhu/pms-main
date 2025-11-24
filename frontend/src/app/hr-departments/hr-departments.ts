import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DepartmentService } from '../../services/department.service';
import { EmployeeService } from '../../services/employee.service';
import { PermissionService } from '../../services/permission.service';

interface Department {
  id: number;
  name: string;
  head_of_department_id?: number | null;
  head_of_department?: { full_name: string } | null;
  description: string | null;
}

@Component({
  selector: 'app-hr-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-departments.html',
  styleUrls: ['./hr-departments.css']
})
export class HrDepartmentsComponent implements OnInit {
  private router = inject(Router);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  public permissionService = inject(PermissionService);

  isSidebarCollapsed = false;
  showModal = false;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  
  departments: Department[] = [];
  employees: any[] = [];

  departmentForm = {
    id: 0,
    name: '',
    head_of_department_id: null as number | null,
    description: ''
  };

  constructor() {}

  ngOnInit() {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments() {
    this.isLoading = true;
    this.errorMessage = '';
    this.departmentService.getAllDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.errorMessage = 'Failed to load departments. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadEmployees() {
    this.employeeService.getAllEmployees(true).subscribe({
      next: (employees: any[]) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
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

  openAddModal() {
    this.isEditMode = false;
    this.errorMessage = '';
    this.departmentForm = {
      id: 0,
      name: '',
      head_of_department_id: null,
      description: ''
    };
    this.showModal = true;
  }

  openEditModal(department: Department) {
    this.isEditMode = true;
    this.errorMessage = '';
    this.departmentForm = {
      id: department.id,
      name: department.name,
      head_of_department_id: department.head_of_department_id || null,
      description: department.description || ''
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.errorMessage = '';
    this.departmentForm = {
      id: 0,
      name: '',
      head_of_department_id: null,
      description: ''
    };
  }

  saveDepartment() {
    if (!this.departmentForm.name.trim()) {
      this.errorMessage = 'Department name is required';
      return;
    }

    const payload: any = {
      name: this.departmentForm.name.trim(),
      description: this.departmentForm.description || null,
      head_of_department_id: this.departmentForm.head_of_department_id || null
    };

    if (this.isEditMode) {
      this.departmentService.updateDepartment(this.departmentForm.id, payload).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating department:', error);
          this.errorMessage = error.error?.error || 'Failed to update department';
        }
      });
    } else {
      this.departmentService.createDepartment(payload).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating department:', error);
          this.errorMessage = error.error?.error || 'Failed to create department';
        }
      });
    }
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          alert('Failed to delete department. Please try again.');
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










