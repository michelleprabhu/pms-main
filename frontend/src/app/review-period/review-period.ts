import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReviewPeriodService } from '../../services/review-period.service';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-review-period',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-period.html',
  styleUrl: './review-period.css',
})
export class ReviewPeriod implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private reviewPeriodService = inject(ReviewPeriodService);
  permissionService = inject(PermissionService);

  isSidebarCollapsed = false;
  showForm = false;
  reviewPeriodForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  activePeriods: any[] = [];
  inactivePeriods: any[] = [];
  isLoading = false;

  constructor() {
    this.reviewPeriodForm = this.fb.group({
      periodName: ['', Validators.required],
      periodType: ['', Validators.required],
      financialPeriod: [''],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', [Validators.required, this.endDateValidator.bind(this)]],
      status: ['Closed', Validators.required]  // Default to 'Closed', is_active synced automatically
    });
  }

  ngOnInit() {
    this.loadReviewPeriods();
  }

  endDateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = this.reviewPeriodForm?.get('startDate')?.value;
    const endDate = control.value;
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return { endDateInvalid: true };
    }
    return null;
  }

  loadReviewPeriods() {
    this.isLoading = true;
    this.reviewPeriodService.getAllReviewPeriods().subscribe({
      next: (periods: any[]) => {
        // Filter by status: 'Open' = active, 'Closed' = inactive
        this.activePeriods = periods.filter(p => p.status === 'Open');
        this.inactivePeriods = periods.filter(p => p.status === 'Closed' || !p.status);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading review periods:', error);
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

  signOut() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showAddForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.reviewPeriodForm.reset({ status: 'Closed' });
    this.errorMessage = '';
    this.successMessage = '';
    // Reset validation state
    Object.keys(this.reviewPeriodForm.controls).forEach(key => {
      this.reviewPeriodForm.get(key)?.setErrors(null);
      this.reviewPeriodForm.get(key)?.markAsUntouched();
    });
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.reviewPeriodForm.controls).forEach(key => {
      this.reviewPeriodForm.get(key)?.markAsTouched();
    });

    if (this.reviewPeriodForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.reviewPeriodForm.value;

    const payload = {
      period_name: formValue.periodName,
      period_type: formValue.periodType,
      financial_period: formValue.financialPeriod || null,
      description: formValue.description || null,
      start_date: formValue.startDate,
      end_date: formValue.endDate,
      status: formValue.status || 'Closed'  // is_active synced automatically by backend
    };

    this.reviewPeriodService.createReviewPeriod(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Review Period created successfully!';
        console.log('Review Period created:', response);
        
        // Reload periods to show new one in table
        this.loadReviewPeriods();
        
        setTimeout(() => {
          this.closeForm();
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating Review Period:', error);
        this.errorMessage = error.error?.error || 'Failed to create Review Period. Please try again.';
      }
    });
  }

  openPeriod(periodId: number) {
    this.isLoading = true;
    this.errorMessage = '';
    this.reviewPeriodService.openReviewPeriod(periodId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Review period opened successfully!';
        this.loadReviewPeriods();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error opening review period:', error);
        this.errorMessage = error.error?.error || 'Failed to open review period. Please try again.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  closePeriod(periodId: number) {
    this.isLoading = true;
    this.errorMessage = '';
    this.reviewPeriodService.closeReviewPeriod(periodId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Review period closed successfully!';
        this.loadReviewPeriods();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error closing review period:', error);
        this.errorMessage = error.error?.error || 'Failed to close review period. Please try again.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
}
