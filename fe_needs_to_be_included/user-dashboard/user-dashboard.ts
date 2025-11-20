import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface RecentActivity {
  id: number;
  username: string;
  action: string;
  actionType: 'login' | 'password_reset' | 'created' | 'role_change' | 'status_change';
  date: string;
  time: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboardComponent {
  isSidebarCollapsed = false;

  // Metrics
  totalUsers = 125;
  activeUsers = 118;
  totalEmployees = 120;
  pendingActions = 7;

  // Recent Activity
  recentActivities: RecentActivity[] = [
    { id: 1, username: 'john.doe', action: 'Login', actionType: 'login', date: '2024-11-16', time: '10:30 AM' },
    { id: 2, username: 'sarah.j', action: 'Password Reset', actionType: 'password_reset', date: '2024-11-16', time: '09:15 AM' },
    { id: 3, username: 'mike.mgr', action: 'Login', actionType: 'login', date: '2024-11-15', time: '04:20 PM' },
    { id: 4, username: 'admin', action: 'Created User: tom.w', actionType: 'created', date: '2024-11-15', time: '02:10 PM' },
    { id: 5, username: 'emma.hr', action: 'Login', actionType: 'login', date: '2024-11-15', time: '01:45 PM' },
    { id: 6, username: 'admin', action: 'Role Change: jane.doe → Manager', actionType: 'role_change', date: '2024-11-15', time: '11:30 AM' },
    { id: 7, username: 'robert.emp', action: 'Password Reset', actionType: 'password_reset', date: '2024-11-14', time: '05:15 PM' },
    { id: 8, username: 'lisa.mgr', action: 'Login', actionType: 'login', date: '2024-11-14', time: '03:00 PM' },
    { id: 9, username: 'admin', action: 'Status Change: ext.user → Inactive', actionType: 'status_change', date: '2024-11-14', time: '02:45 PM' },
    { id: 10, username: 'david.dev', action: 'Login', actionType: 'login', date: '2024-11-14', time: '12:20 PM' },
    { id: 11, username: 'admin', action: 'Created User: new.employee', actionType: 'created', date: '2024-11-14', time: '10:00 AM' },
    { id: 12, username: 'anna.hr', action: 'Password Reset', actionType: 'password_reset', date: '2024-11-13', time: '04:30 PM' },
    { id: 13, username: 'ext.consultant', action: 'Login', actionType: 'login', date: '2024-11-13', time: '02:15 PM' },
    { id: 14, username: 'admin', action: 'Role Change: mike.emp → HR Admin', actionType: 'role_change', date: '2024-11-13', time: '11:00 AM' },
    { id: 15, username: 'tech.support', action: 'Login', actionType: 'login', date: '2024-11-13', time: '09:00 AM' }
  ];

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToRoles() {
    this.router.navigate(['/roles']);
  }

  getActionClass(actionType: string): string {
    switch(actionType) {
      case 'login': return 'action-login';
      case 'password_reset': return 'action-password';
      case 'created': return 'action-created';
      case 'role_change': return 'action-role';
      case 'status_change': return 'action-status';
      default: return '';
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}






