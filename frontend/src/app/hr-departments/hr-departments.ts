import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Department {
  id: number;
  name: string;
  head: string | null;
  employeeCount: number;
  description: string;
}

@Component({
  selector: 'app-hr-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-departments.html',
  styleUrls: ['./hr-departments.css']
})
export class HrDepartmentsComponent {
  isSidebarCollapsed = false;
  showModal = false;
  isEditMode = false;
  
  departments: Department[] = [
    { id: 1, name: 'Sales', head: 'John Smith', employeeCount: 25, description: 'Sales and business development' },
    { id: 2, name: 'IT', head: 'Sarah Johnson', employeeCount: 15, description: 'Information technology and systems' },
    { id: 3, name: 'HR', head: 'Anna Lee', employeeCount: 5, description: 'Human resources management' },
    { id: 4, name: 'Operations', head: null, employeeCount: 30, description: 'Operations and logistics' },
    { id: 5, name: 'Finance', head: 'Mike Brown', employeeCount: 8, description: 'Financial management and accounting' }
  ];

  // Mock employee list for dropdown
  employees = [
    'John Smith',
    'Sarah Johnson',
    'Anna Lee',
    'Mike Brown',
    'David Wilson',
    'Emily Davis',
    'Robert Taylor',
    'Maria Garcia'
  ];

  departmentForm = {
    id: 0,
    name: '',
    head: null as string | null,
    description: ''
  };

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

  openAddModal() {
    this.isEditMode = false;
    this.departmentForm = {
      id: 0,
      name: '',
      head: null,
      description: ''
    };
    this.showModal = true;
  }

  openEditModal(department: Department) {
    this.isEditMode = true;
    this.departmentForm = {
      id: department.id,
      name: department.name,
      head: department.head,
      description: department.description
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.departmentForm = {
      id: 0,
      name: '',
      head: null,
      description: ''
    };
  }

  saveDepartment() {
    if (!this.departmentForm.name.trim()) {
      alert('Department name is required');
      return;
    }

    if (this.isEditMode) {
      // Update existing department
      const index = this.departments.findIndex(d => d.id === this.departmentForm.id);
      if (index !== -1) {
        this.departments[index] = {
          ...this.departments[index],
          name: this.departmentForm.name,
          head: this.departmentForm.head,
          description: this.departmentForm.description
        };
      }
    } else {
      // Add new department
      const newDepartment: Department = {
        id: Math.max(...this.departments.map(d => d.id)) + 1,
        name: this.departmentForm.name,
        head: this.departmentForm.head,
        employeeCount: 0,
        description: this.departmentForm.description
      };
      this.departments.push(newDepartment);
    }

    this.closeModal();
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.departments = this.departments.filter(d => d.id !== id);
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}










