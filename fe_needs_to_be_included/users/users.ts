import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  linkedEmployee: string | null;
  lastLogin: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent {
  isSidebarCollapsed = false;
  showPasswordResetModal = false;
  selectedUser: User | null = null;
  generatedPassword = '';

  users: User[] = [
    { id: 1, username: 'admin.user', email: 'admin@rpcdata.com', role: 'User Admin', status: 'Active', linkedEmployee: null, lastLogin: '2024-11-16 10:30 AM' },
    { id: 2, username: 'hr.admin', email: 'hradmin@rpcdata.com', role: 'User Admin', status: 'Active', linkedEmployee: null, lastLogin: '2024-11-15 04:15 PM' },
    { id: 3, username: 'john.doe', email: 'john@rpcdata.com', role: 'HR Admin', status: 'Active', linkedEmployee: 'Sarah Johnson', lastLogin: '2024-11-16 09:45 AM' },
    { id: 4, username: 'sarah.j', email: 'sarah@rpcdata.com', role: 'HR Admin', status: 'Active', linkedEmployee: 'Sarah Johnson', lastLogin: '2024-11-16 09:15 AM' },
    { id: 5, username: 'emma.hr', email: 'emma@rpcdata.com', role: 'HR Admin', status: 'Active', linkedEmployee: 'Anna Lee', lastLogin: '2024-11-15 01:45 PM' },
    { id: 6, username: 'anna.lee', email: 'anna@rpcdata.com', role: 'HR Admin', status: 'Active', linkedEmployee: 'Anna Lee', lastLogin: '2024-11-13 04:30 PM' },
    { id: 7, username: 'mike.mgr', email: 'mike@rpcdata.com', role: 'Manager', status: 'Active', linkedEmployee: 'Mike Brown', lastLogin: '2024-11-15 04:20 PM' },
    { id: 8, username: 'lisa.mgr', email: 'lisa@rpcdata.com', role: 'Manager', status: 'Active', linkedEmployee: 'Lisa Thompson', lastLogin: '2024-11-14 03:00 PM' },
    { id: 9, username: 'david.mgr', email: 'david@rpcdata.com', role: 'Manager', status: 'Inactive', linkedEmployee: 'David Wilson', lastLogin: '2024-10-20 03:45 PM' },
    { id: 10, username: 'robert.emp', email: 'robert@rpcdata.com', role: 'Employee', status: 'Active', linkedEmployee: 'Robert Taylor', lastLogin: '2024-11-14 05:15 PM' },
    { id: 11, username: 'maria.emp', email: 'maria@rpcdata.com', role: 'Employee', status: 'Active', linkedEmployee: 'Maria Garcia', lastLogin: '2024-11-14 12:20 PM' },
    { id: 12, username: 'james.emp', email: 'james@rpcdata.com', role: 'Employee', status: 'Active', linkedEmployee: 'James Anderson', lastLogin: '2024-11-13 09:00 AM' },
    { id: 13, username: 'jennifer.emp', email: 'jennifer@rpcdata.com', role: 'Employee', status: 'Inactive', linkedEmployee: 'Jennifer Martinez', lastLogin: '2024-09-15 02:30 PM' },
    { id: 14, username: 'external.it', email: 'ext@consultant.com', role: 'External User', status: 'Active', linkedEmployee: null, lastLogin: '2024-11-14 02:15 PM' },
    { id: 15, username: 'ext.consultant', email: 'consultant@external.com', role: 'External User', status: 'Active', linkedEmployee: null, lastLogin: '2024-11-13 02:15 PM' },
    { id: 16, username: 'temp.user', email: 'temp@external.com', role: 'External User', status: 'Inactive', linkedEmployee: null, lastLogin: '2024-10-01 11:00 AM' }
  ];

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/user-dashboard']);
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToRoles() {
    this.router.navigate(['/roles']);
  }

  addUser() {
    this.router.navigate(['/users/add']);
  }

  editUser(id: number) {
    this.router.navigate(['/users/edit', id]);
  }

  openPasswordResetModal(user: User) {
    this.selectedUser = user;
    this.generatedPassword = this.generatePassword();
    this.showPasswordResetModal = true;
  }

  closePasswordResetModal() {
    this.showPasswordResetModal = false;
    this.selectedUser = null;
    this.generatedPassword = '';
  }

  generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  copyPassword() {
    navigator.clipboard.writeText(this.generatedPassword);
    alert('Password copied to clipboard!');
  }

  confirmReset() {
    alert(`Password reset for user: ${this.selectedUser?.username}`);
    this.closePasswordResetModal();
  }

  deleteUser(id: number, username: string) {
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
      this.users = this.users.filter(u => u.id !== id);
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}



