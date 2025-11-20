import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css']
})
export class UserFormComponent implements OnInit {
  isSidebarCollapsed = false;
  isEditMode = false;
  userId: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  userForm = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
    status: 'Active',
    linkedEmployee: '',
    isNonEmployee: false
  };

  roleOptions = ['User Admin', 'HR Admin', 'Manager', 'Employee', 'External User'];
  statusOptions = ['Active', 'Inactive'];
  employeeOptions = [
    'EMP001 - Sarah Johnson',
    'EMP002 - John Smith',
    'EMP003 - Anna Lee',
    'EMP004 - Mike Brown',
    'EMP005 - David Wilson',
    'EMP006 - Emily Davis',
    'EMP007 - Robert Taylor',
    'EMP008 - Maria Garcia',
    'EMP009 - James Anderson',
    'EMP010 - Jennifer Martinez'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      this.isEditMode = !!this.userId;
      
      if (this.isEditMode) {
        this.loadUserData(this.userId!);
      }
    });
  }

  loadUserData(id: string) {
    // Mock data loading
    this.userForm = {
      username: 'john.doe',
      email: 'john@rpcdata.com',
      password: '',
      confirmPassword: '',
      role: 'HR Admin',
      status: 'Active',
      linkedEmployee: 'EMP002 - John Smith',
      isNonEmployee: false
    };
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onNonEmployeeChange() {
    if (this.userForm.isNonEmployee) {
      this.userForm.linkedEmployee = '';
    }
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

  backToUsers() {
    this.router.navigate(['/users']);
  }

  saveUser() {
    // Validation
    if (!this.userForm.username || !this.userForm.email || !this.userForm.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (!this.isEditMode) {
      if (!this.userForm.password || this.userForm.password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
      }
      if (this.userForm.password !== this.userForm.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    alert('User saved successfully!');
    this.router.navigate(['/users']);
  }

  cancel() {
    this.router.navigate(['/users']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}





