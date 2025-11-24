import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { HrDashboard } from './hr-dashboard/hr-dashboard';
import { ManagerDashboard } from './manager-dashboard/manager-dashboard';
import { EmployeeDashboard } from './employee-dashboard/employee-dashboard';
import { ReviewPeriod } from './review-period/review-period';
import { ScoreCards } from './score-cards/score-cards';
import { ScoreCardDetails } from './score-card-details/score-card-details';
import { EvaluationComponent } from './evaluation/evaluation';
import { EvaluationDetailsComponent } from './evaluation-details/evaluation-details';
import { EmployeeScoreCardsComponent } from './employee-score-cards/employee-score-cards';
import { EmployeeMyProfileComponent } from './employee-my-profile/employee-my-profile';
import { EmployeeScoreCardDetailsComponent } from './employee-score-card-details/employee-score-card-details';
import { EmployeeSelfEvaluationComponent } from './employee-self-evaluation/employee-self-evaluation';
import { EmployeeSelfEvaluationDetailsComponent } from './employee-self-evaluation-details/employee-self-evaluation-details';
import { EmployeeRatingsComponent } from './employee-ratings/employee-ratings';
import { EmployeeRatingsDetailsComponent } from './employee-ratings-details/employee-ratings-details';
import { ManagerScoreCardsComponent } from './manager-score-cards/manager-score-cards';
import { ManagerScoreCardDetailsComponent } from './manager-score-card-details/manager-score-card-details';
import { ManagerEvaluationComponent } from './manager-evaluation/manager-evaluation';
import { ManagerEvaluationDetailsComponent } from './manager-evaluation-details/manager-evaluation-details';
import { ManagerEvaluationPeriodsComponent } from './manager-evaluation-periods/manager-evaluation-periods';
import { EvaluationPeriodsComponent } from './evaluation-periods/evaluation-periods';
import { PlanningComponent } from './planning/planning';
import { PlanningEmployeesComponent } from './planning-employees/planning-employees';
import { PlanningEmployeeDetailComponent } from './planning-employee-detail/planning-employee-detail';
import { ScoreCardsListComponent } from './score-cards-list/score-cards-list';
import { ScoreCardEmployeeDetailComponent } from './score-card-employee-detail/score-card-employee-detail';
import { ManagerScoreCardsListComponent } from './manager-score-cards-list/manager-score-cards-list';
import { ManagerScoreCardEmployeeDetailComponent } from './manager-score-card-employee-detail/manager-score-card-employee-detail';
import { ManagerMyProfileComponent } from './manager-my-profile/manager-my-profile';
import { ManagerSelfEvaluationComponent } from './manager-self-evaluation/manager-self-evaluation';
import { ManagerSelfEvaluationDetailsComponent } from './manager-self-evaluation-details/manager-self-evaluation-details';
import { HrManagementComponent } from './hr-management/hr-management';
import { HrEmployeesComponent } from './hr-employees/hr-employees';
import { HrEmployeeFormComponent } from './hr-employee-form/hr-employee-form';
import { HrEmployeeViewComponent } from './hr-employee-view/hr-employee-view';
import { HrDepartmentsComponent } from './hr-departments/hr-departments';
import { HrPositionsComponent } from './hr-positions/hr-positions';
import { HrReportsComponent } from './hr-reports/hr-reports';
import { PermissionGuard } from '../guards/permission.guard';
import { HrPermissionsComponent } from './hr-permissions/hr-permissions';
import { HrUsersComponent } from './hr-users/hr-users';
import { GoalsLibraryComponent } from './goals-library/goals-library';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'hr-dashboard', component: HrDashboard },
  { path: 'review-period', component: ReviewPeriod },
  { path: 'planning', component: PlanningComponent, data: { permissions: ['view_planning_page'] }, canActivate: [PermissionGuard] },
  { path: 'planning/employees', component: PlanningEmployeesComponent },
  { path: 'planning/employee-detail/:id', component: PlanningEmployeeDetailComponent },
  { path: 'score-cards', component: ScoreCards, data: { permissions: ['view_scorecards_page'] }, canActivate: [PermissionGuard] },
  { path: 'score-cards/list', component: ScoreCardsListComponent, data: { permissions: ['view_scorecards_page'] }, canActivate: [PermissionGuard] },
  { path: 'score-cards/employee-detail/:id', component: ScoreCardEmployeeDetailComponent },
  { path: 'score-card-details', component: ScoreCardDetails },
  { path: 'evaluation-periods', component: EvaluationPeriodsComponent, data: { permissions: ['view_evaluation_page'] }, canActivate: [PermissionGuard] },
  { path: 'evaluation', component: EvaluationComponent },
  { path: 'evaluation-details', component: EvaluationDetailsComponent },
  { path: 'manager-dashboard', component: ManagerDashboard, data: { permissions: ['view_manager_dashboard'] }, canActivate: [PermissionGuard] },
  { path: 'manager-score-cards', component: ManagerScoreCardsComponent, data: { permissions: ['view_team_score_cards'] }, canActivate: [PermissionGuard] },
  { path: 'manager-score-cards/list', component: ManagerScoreCardsListComponent, data: { permissions: ['view_team_score_cards'] }, canActivate: [PermissionGuard] },
  { path: 'manager-score-cards/employee-detail/:id', component: ManagerScoreCardEmployeeDetailComponent },
  { path: 'manager-score-card-details', component: ManagerScoreCardDetailsComponent },
  { path: 'manager-evaluation-periods', component: ManagerEvaluationPeriodsComponent },
  { path: 'manager-evaluation', component: ManagerEvaluationComponent },
  { path: 'manager-evaluation-details', component: ManagerEvaluationDetailsComponent },
  { path: 'manager-my-profile', component: ManagerMyProfileComponent },
  { path: 'manager-self-evaluation', component: ManagerSelfEvaluationComponent },
  { path: 'manager-self-evaluation-details', component: ManagerSelfEvaluationDetailsComponent },
  { path: 'employee-dashboard', component: EmployeeDashboard, data: { permissions: ['view_employee_dashboard'] }, canActivate: [PermissionGuard] },
  { path: 'employee-score-cards', component: EmployeeScoreCardsComponent, data: { permissions: ['view_employee_scorecards'] }, canActivate: [PermissionGuard] },
  { path: 'employee-my-profile', component: EmployeeMyProfileComponent },
  { path: 'employee-score-card-details', component: EmployeeScoreCardDetailsComponent, data: { permissions: ['view_employee_scorecards'] }, canActivate: [PermissionGuard] },
  { path: 'employee-self-evaluation', component: EmployeeSelfEvaluationComponent, data: { permissions: ['view_self_evaluation'] }, canActivate: [PermissionGuard] },
  { path: 'employee-self-evaluation-details', component: EmployeeSelfEvaluationDetailsComponent, data: { permissions: ['view_self_evaluation'] }, canActivate: [PermissionGuard] },
  { path: 'employee-ratings', component: EmployeeRatingsComponent, data: { permissions: ['view_employee_ratings'] }, canActivate: [PermissionGuard] },
  { path: 'employee-ratings-details', component: EmployeeRatingsDetailsComponent, data: { permissions: ['view_employee_ratings'] }, canActivate: [PermissionGuard] },
  { path: 'hr-management', component: HrManagementComponent, data: { permissions: ['view_hr_management_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-employees', component: HrEmployeesComponent, data: { permissions: ['view_hr_employees_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-employees/add', component: HrEmployeeFormComponent, data: { permissions: ['view_hr_employees_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-employees/edit/:id', component: HrEmployeeFormComponent, data: { permissions: ['view_hr_employees_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-employees/view/:id', component: HrEmployeeViewComponent, data: { permissions: ['view_hr_employees_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-departments', component: HrDepartmentsComponent, data: { permissions: ['view_hr_departments_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-positions', component: HrPositionsComponent, data: { permissions: ['view_hr_positions_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-users', component: HrUsersComponent, data: { permissions: ['view_hr_management_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-reports', component: HrReportsComponent, data: { permissions: ['view_hr_reports_page'] }, canActivate: [PermissionGuard] },
  { path: 'hr-permissions', component: HrPermissionsComponent, data: { permissions: ['manage_permissions'] }, canActivate: [PermissionGuard] },
  { path: 'goals-library', component: GoalsLibraryComponent, data: { permissions: ['view_hr_management_page'] }, canActivate: [PermissionGuard] },
  { path: 'planning/eligibility-profiles', loadComponent: () => import('./eligibility-profiles/eligibility-profiles').then(m => m.EligibilityProfilesComponent), data: { permissions: ['generate_score_cards'] }, canActivate: [PermissionGuard] },
  { path: '**', redirectTo: '/login' }
];

