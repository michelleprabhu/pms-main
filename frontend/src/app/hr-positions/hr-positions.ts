import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PositionService } from '../../services/position.service';
import { DepartmentService } from '../../services/department.service';
import { PermissionService } from '../../services/permission.service';

interface Position {
  id: number;
  title: string;
  department_id?: number | null;
  department?: { name: string } | null;
  grade_level: string | null;
  description: string | null;
}

@Component({
  selector: 'app-hr-positions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-positions.html',
  styleUrls: ['./hr-positions.css']
})
export class HrPositionsComponent implements OnInit {
  private router = inject(Router);
  private positionService = inject(PositionService);
  private departmentService = inject(DepartmentService);
  public permissionService = inject(PermissionService);

  isSidebarCollapsed = false;
  showModal = false;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  
  positions: Position[] = [];
  departments: any[] = [];
  gradeLevels = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

  positionForm = {
    id: 0,
    title: '',
    department_id: null as number | null,
    grade_level: '',
    description: ''
  };

  constructor() {}

  ngOnInit() {
    this.loadPositions();
    this.loadDepartments();
  }

  loadPositions() {
    this.isLoading = true;
    this.errorMessage = '';
    this.positionService.getAllPositions().subscribe({
      next: (positions: Position[]) => {
        this.positions = positions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading positions:', error);
        this.errorMessage = 'Failed to load positions. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments: any[]) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
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
    this.positionForm = {
      id: 0,
      title: '',
      department_id: null,
      grade_level: '',
      description: ''
    };
    this.showModal = true;
  }

  openEditModal(position: Position) {
    this.isEditMode = true;
    this.errorMessage = '';
    this.positionForm = {
      id: position.id,
      title: position.title,
      department_id: position.department_id || null,
      grade_level: position.grade_level || '',
      description: position.description || ''
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.errorMessage = '';
    this.positionForm = {
      id: 0,
      title: '',
      department_id: null,
      grade_level: '',
      description: ''
    };
  }

  savePosition() {
    if (!this.positionForm.title.trim()) {
      this.errorMessage = 'Position title is required';
      return;
    }

    const payload: any = {
      title: this.positionForm.title.trim(),
      department_id: this.positionForm.department_id || null,
      grade_level: this.positionForm.grade_level || null,
      description: this.positionForm.description || null
    };

    if (this.isEditMode) {
      this.positionService.updatePosition(this.positionForm.id, payload).subscribe({
        next: () => {
          this.loadPositions();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating position:', error);
          this.errorMessage = error.error?.error || 'Failed to update position';
        }
      });
    } else {
      this.positionService.createPosition(payload).subscribe({
        next: () => {
          this.loadPositions();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating position:', error);
          this.errorMessage = error.error?.error || 'Failed to create position';
        }
      });
    }
  }

  deletePosition(id: number) {
    if (confirm('Are you sure you want to delete this position?')) {
      this.positionService.deletePosition(id).subscribe({
        next: () => {
          this.loadPositions();
        },
        error: (error) => {
          console.error('Error deleting position:', error);
          alert('Failed to delete position. Please try again.');
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









