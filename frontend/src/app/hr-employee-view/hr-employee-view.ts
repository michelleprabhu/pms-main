import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface Education {
  id: number;
  degree: string;
  institution: string;
  year: number;
  fieldOfStudy: string;
}

interface Certification {
  id: number;
  name: string;
  issuingOrg: string;
  issueDate: string;
  expiryDate: string;
  certificationId: string;
}

interface Document {
  id: number;
  type: string;
  fileName: string;
  uploadDate: string;
  description: string;
}

@Component({
  selector: 'app-hr-employee-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-employee-view.html',
  styleUrls: ['./hr-employee-view.css']
})
export class HrEmployeeViewComponent implements OnInit {
  isSidebarCollapsed = false;
  employeeId: string | null = null;

  employeeData = {
    employeeId: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    joiningDate: '',
    position: '',
    department: '',
    reportingManager: '',
    employmentStatus: '',
    salaryGrade: '',
    linkedUser: ''
  };

  educationList: Education[] = [];
  certificationList: Certification[] = [];
  documentList: Document[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.loadEmployeeData(this.employeeId);
      }
    });
  }

  loadEmployeeData(id: string) {
    // Mock data loading
    this.employeeData = {
      employeeId: id,
      fullName: 'John Smith',
      dateOfBirth: '1990-05-15',
      gender: 'Male',
      email: 'john.smith@company.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      joiningDate: '2020-01-15',
      position: 'Senior Manager',
      department: 'Sales',
      reportingManager: 'None',
      employmentStatus: 'Active',
      salaryGrade: 'Grade 5',
      linkedUser: 'None'
    };

    this.educationList = [
      { id: 1, degree: 'MBA', institution: 'Harvard Business School', year: 2015, fieldOfStudy: 'Business Management' },
      { id: 2, degree: 'Bachelor of Commerce', institution: 'University of California', year: 2010, fieldOfStudy: 'Commerce' }
    ];

    this.certificationList = [
      { id: 1, name: 'PMP', issuingOrg: 'PMI', issueDate: '2020-03-15', expiryDate: '2023-03-15', certificationId: 'PMP-12345' }
    ];

    this.documentList = [
      { id: 1, type: 'Resume', fileName: 'john_smith_resume.pdf', uploadDate: '2020-01-10', description: 'Latest resume' },
      { id: 2, type: 'ID Proof', fileName: 'drivers_license.pdf', uploadDate: '2020-01-10', description: 'Government ID' }
    ];
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

  backToEmployees() {
    this.router.navigate(['/hr-employees']);
  }

  editEmployee() {
    this.router.navigate(['/hr-employees/edit', this.employeeId]);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}









