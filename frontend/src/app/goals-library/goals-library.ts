import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoalsLibraryService } from '../../services/goals-library.service';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-goals-library',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './goals-library.html',
  styleUrl: './goals-library.css',
})
export class GoalsLibraryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private goalsLibraryService = inject(GoalsLibraryService);
  permissionService = inject(PermissionService);

  isSidebarCollapsed = false;
  showForm = false;
  goalForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  goals: any[] = [];
  filteredGoals: any[] = [];
  isLoading = false;
  isEditMode = false;
  editingGoalId: number | null = null;

  // Filter options
  categories: string[] = [];
  selectedCategory = '';
  selectedGoalType = '';
  selectedStatus = 'active';
  searchQuery = '';

  goalTypes = ['Personal Goal', 'Development Goal', 'Business Goal'];

  constructor() {
    this.goalForm = this.fb.group({
      goal_name: ['', Validators.required],
      description: [''],
      goal_type: ['', Validators.required],
      category: ['']
    });
  }

  ngOnInit() {
    this.loadGoals();
    this.loadCategories();
  }

  loadGoals() {
    this.isLoading = true;
    const includeInactive = this.selectedStatus === 'all';
    this.goalsLibraryService.getAllGoals(
      this.selectedCategory || undefined,
      this.selectedGoalType || undefined,
      includeInactive
    ).subscribe({
      next: (goals: any) => {
        // Service already extracts the goals array, so use it directly
        this.goals = Array.isArray(goals) ? goals : [];
        console.log(`[GoalsLibrary] Loaded ${this.goals.length} goals`);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[GoalsLibrary] Error loading goals:', error);
        this.goals = [];
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    this.goalsLibraryService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.categories || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  applyFilters() {
    this.filteredGoals = this.goals.filter(goal => {
      const matchesCategory = !this.selectedCategory || goal.category === this.selectedCategory;
      const matchesGoalType = !this.selectedGoalType || goal.goal_type === this.selectedGoalType;
      const matchesStatus = this.selectedStatus === 'all' || 
        (this.selectedStatus === 'active' && goal.is_active) ||
        (this.selectedStatus === 'inactive' && !goal.is_active);
      const matchesSearch = !this.searchQuery || 
        goal.goal_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (goal.description && goal.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      return matchesCategory && matchesGoalType && matchesStatus && matchesSearch;
    });
  }

  onFilterChange() {
    this.applyFilters();
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

  navigateToGoalsLibrary() {
    // Already on this page
  }

  signOut() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showAddForm() {
    this.isEditMode = false;
    this.editingGoalId = null;
    this.goalForm.reset({
      goal_name: '',
      description: '',
      goal_type: '',
      category: ''
    });
    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm() {
    this.showForm = false;
    this.isEditMode = false;
    this.editingGoalId = null;
    this.goalForm.reset({
      goal_name: '',
      description: '',
      goal_type: '',
      category: ''
    });
    this.errorMessage = '';
    this.successMessage = '';
    Object.keys(this.goalForm.controls).forEach(key => {
      this.goalForm.get(key)?.setErrors(null);
      this.goalForm.get(key)?.markAsUntouched();
    });
  }

  editGoal(goal: any) {
    this.isEditMode = true;
    this.editingGoalId = goal.id;
    this.goalForm.patchValue({
      goal_name: goal.goal_name,
      description: goal.description || '',
      goal_type: goal.goal_type,
      category: goal.category || ''
    });
    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteGoal(goalId: number) {
    if (!confirm('Are you sure you want to delete this goal template?')) {
      return;
    }

    this.goalsLibraryService.deleteGoal(goalId).subscribe({
      next: () => {
        this.successMessage = 'Goal template deleted successfully!';
        this.loadGoals();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting goal:', error);
        this.errorMessage = error.error?.error || 'Failed to delete goal template. Please try again.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  onSubmit() {
    Object.keys(this.goalForm.controls).forEach(key => {
      this.goalForm.get(key)?.markAsTouched();
    });

    if (this.goalForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.goalForm.value;
    const payload = {
      goal_name: formValue.goal_name,
      description: formValue.description || null,
      goal_type: formValue.goal_type,
      category: formValue.category || null
    };

    if (this.isEditMode && this.editingGoalId) {
      this.goalsLibraryService.updateGoal(this.editingGoalId, payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = 'Goal template updated successfully!';
          this.loadGoals();
          setTimeout(() => {
            this.closeForm();
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating goal:', error);
          this.errorMessage = error.error?.error || 'Failed to update goal template. Please try again.';
        }
      });
    } else {
      this.goalsLibraryService.createGoal(payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = 'Goal template created successfully!';
          this.loadGoals();
          this.loadCategories(); // Reload categories in case new category was added
          setTimeout(() => {
            this.closeForm();
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating goal:', error);
          this.errorMessage = error.error?.error || 'Failed to create goal template. Please try again.';
        }
      });
    }
  }
}

