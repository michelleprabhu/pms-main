import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Position {
  id: number;
  title: string;
  department: string;
  gradeLevel: string;
  employeeCount: number;
  description: string;
}

@Component({
  selector: 'app-hr-positions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-positions.html',
  styleUrls: ['./hr-positions.css']
})
export class HrPositionsComponent {
  isSidebarCollapsed = false;
  showModal = false;
  isEditMode = false;
  
  positions: Position[] = [
    { id: 1, title: 'Senior Manager', department: 'Sales', gradeLevel: 'Grade 5', employeeCount: 8, description: 'Senior sales management role' },
    { id: 2, title: 'Developer', department: 'IT', gradeLevel: 'Grade 3', employeeCount: 12, description: 'Software development role' },
    { id: 3, title: 'HR Specialist', department: 'HR', gradeLevel: 'Grade 3', employeeCount: 3, description: 'Human resources specialist' },
    { id: 4, title: 'Account Manager', department: 'Sales', gradeLevel: 'Grade 4', employeeCount: 10, description: 'Client account management' },
    { id: 5, title: 'QA Analyst', department: 'IT', gradeLevel: 'Grade 2', employeeCount: 5, description: 'Quality assurance testing' },
    { id: 6, title: 'Designer', department: 'IT', gradeLevel: 'Grade 3', employeeCount: 4, description: 'UI/UX design role' },
    { id: 7, title: 'Sales Executive', department: 'Sales', gradeLevel: 'Grade 2', employeeCount: 15, description: 'Sales execution role' },
    { id: 8, title: 'Operations Manager', department: 'Operations', gradeLevel: 'Grade 4', employeeCount: 6, description: 'Operations management' }
  ];

  departments = ['Sales', 'IT', 'HR', 'Operations', 'Finance'];
  gradeLevels = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

  positionForm = {
    id: 0,
    title: '',
    department: '',
    gradeLevel: '',
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
    this.positionForm = {
      id: 0,
      title: '',
      department: '',
      gradeLevel: '',
      description: ''
    };
    this.showModal = true;
  }

  openEditModal(position: Position) {
    this.isEditMode = true;
    this.positionForm = {
      id: position.id,
      title: position.title,
      department: position.department,
      gradeLevel: position.gradeLevel,
      description: position.description
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.positionForm = {
      id: 0,
      title: '',
      department: '',
      gradeLevel: '',
      description: ''
    };
  }

  savePosition() {
    if (!this.positionForm.title.trim() || !this.positionForm.department || !this.positionForm.gradeLevel) {
      alert('Position Title, Department, and Grade Level are required');
      return;
    }

    if (this.isEditMode) {
      // Update existing position
      const index = this.positions.findIndex(p => p.id === this.positionForm.id);
      if (index !== -1) {
        this.positions[index] = {
          ...this.positions[index],
          title: this.positionForm.title,
          department: this.positionForm.department,
          gradeLevel: this.positionForm.gradeLevel,
          description: this.positionForm.description
        };
      }
    } else {
      // Add new position
      const newPosition: Position = {
        id: Math.max(...this.positions.map(p => p.id)) + 1,
        title: this.positionForm.title,
        department: this.positionForm.department,
        gradeLevel: this.positionForm.gradeLevel,
        employeeCount: 0,
        description: this.positionForm.description
      };
      this.positions.push(newPosition);
    }

    this.closeModal();
  }

  deletePosition(id: number) {
    if (confirm('Are you sure you want to delete this position?')) {
      this.positions = this.positions.filter(p => p.id !== id);
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}









