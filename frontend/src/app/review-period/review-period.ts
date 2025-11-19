import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReviewPeriodService } from '../../services/review-period.service';

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
      status: ['Draft', Validators.required],
      isActive: [false]
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
        this.activePeriods = periods.filter(p => p.is_active === true);
        this.inactivePeriods = periods.filter(p => p.is_active === false);
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

  signOut() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showAddForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.reviewPeriodForm.reset({ status: 'Draft', isActive: false });
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
      status: formValue.status || 'Draft',
      is_active: formValue.isActive || false
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
}
