import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoalService } from '../services/goal.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-goal-planner',
  templateUrl: './goal-planner.component.html',
  styleUrls: ['./goal-planner.component.css'],
  imports: [FormsModule, CommonModule]
})
export class GoalPlannerComponent implements OnInit {
  goals: any[] = [];
  newGoal = {
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  };
  currentUser: any;

  constructor(
    private goalService: GoalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user: any) => {
      this.currentUser = user;
      this.loadUserGoals();
    });
  }

  loadUserGoals(): void {
    if (this.currentUser && this.currentUser.id) {
      this.goalService.getGoals(this.currentUser.id).subscribe((data: any[]) => {
        this.goals = data;
      });
    }
  }

  createGoal(): void {
    this.goalService.createGoal({
      ...this.newGoal,
      userId: this.currentUser.id
    }).subscribe(() => {
      this.loadUserGoals();
      this.resetForm();
    });
  }

  resetForm(): void {
    this.newGoal = {
      title: '',
      description: '',
      startDate: '',
      endDate: ''
    };
  }

  deleteGoal(id: number): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(id).subscribe(() => {
        this.loadUserGoals();
      });
    }
  }
}