import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-hr-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-employee-form.html',
  styleUrls: ['./hr-employee-form.css']
})
export class HrEmployeeFormComponent implements OnInit {
  isSidebarCollapsed = false;
  isEditMode = false;
  employeeId: string | null = null;

  // Modal states
  showEducationModal = false;
  showCertificationModal = false;
  showDocumentModal = false;
  
  // Form data
  employeeForm = {
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

  // Sub-tables data
  educationList: Education[] = [];
  certificationList: Certification[] = [];
  documentList: Document[] = [];

  // Education form
  educationForm = {
    id: 0,
    degree: '',
    institution: '',
    year: 0,
    fieldOfStudy: ''
  };
  editingEducationId: number | null = null;

  // Certification form
  certificationForm = {
    id: 0,
    name: '',
    issuingOrg: '',
    issueDate: '',
    expiryDate: '',
    certificationId: ''
  };
  editingCertificationId: number | null = null;

  // Document form
  documentForm = {
    id: 0,
    type: '',
    fileName: '',
    uploadDate: '',
    description: ''
  };
  editingDocumentId: number | null = null;

  // Dropdown options
  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  positionOptions = ['Senior Manager', 'Developer', 'HR Specialist', 'QA Analyst', 'Account Manager', 'Designer', 'Sales Executive'];
  departmentOptions = ['Sales', 'IT', 'HR', 'Operations', 'Finance'];
  managerOptions = ['None', 'John Smith', 'Sarah Johnson', 'Anna Lee', 'Mike Brown', 'David Wilson'];
  statusOptions = ['Active', 'On Leave', 'Terminated'];
  gradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  documentTypeOptions = ['Resume', 'ID Proof', 'Certificate', 'Other'];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      this.isEditMode = !!this.employeeId;
      
      if (this.isEditMode) {
        this.loadEmployeeData(this.employeeId!);
      } else {
        this.employeeForm.employeeId = 'EMP' + (Math.floor(Math.random() * 900) + 100).toString().padStart(3, '0');
      }
    });
  }

  loadEmployeeData(id: string) {
    // Mock data loading - in real app, this would be an API call
    this.employeeForm = {
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
      linkedUser: ''
    };

    // Mock education data
    this.educationList = [
      { id: 1, degree: 'MBA', institution: 'Harvard Business School', year: 2015, fieldOfStudy: 'Business Management' },
      { id: 2, degree: 'Bachelor of Commerce', institution: 'University of California', year: 2010, fieldOfStudy: 'Commerce' }
    ];

    // Mock certification data
    this.certificationList = [
      { id: 1, name: 'PMP', issuingOrg: 'PMI', issueDate: '2020-03-15', expiryDate: '2023-03-15', certificationId: 'PMP-12345' }
    ];

    // Mock document data
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

  // Education methods
  openAddEducationModal() {
    this.editingEducationId = null;
    this.educationForm = {
      id: 0,
      degree: '',
      institution: '',
      year: new Date().getFullYear(),
      fieldOfStudy: ''
    };
    this.showEducationModal = true;
  }

  openEditEducationModal(education: Education) {
    this.editingEducationId = education.id;
    this.educationForm = { ...education };
    this.showEducationModal = true;
  }

  closeEducationModal() {
    this.showEducationModal = false;
    this.editingEducationId = null;
  }

  saveEducation() {
    if (!this.educationForm.degree || !this.educationForm.institution || !this.educationForm.year) {
      alert('Degree, Institution, and Year are required');
      return;
    }

    if (this.editingEducationId) {
      const index = this.educationList.findIndex(e => e.id === this.editingEducationId);
      if (index !== -1) {
        this.educationList[index] = { ...this.educationForm };
      }
    } else {
      const newEducation: Education = {
        ...this.educationForm,
        id: Math.max(...this.educationList.map(e => e.id), 0) + 1
      };
      this.educationList.push(newEducation);
    }

    this.closeEducationModal();
  }

  deleteEducation(id: number) {
    if (confirm('Are you sure you want to delete this education record?')) {
      this.educationList = this.educationList.filter(e => e.id !== id);
    }
  }

  // Certification methods
  openAddCertificationModal() {
    this.editingCertificationId = null;
    this.certificationForm = {
      id: 0,
      name: '',
      issuingOrg: '',
      issueDate: '',
      expiryDate: '',
      certificationId: ''
    };
    this.showCertificationModal = true;
  }

  openEditCertificationModal(cert: Certification) {
    this.editingCertificationId = cert.id;
    this.certificationForm = { ...cert };
    this.showCertificationModal = true;
  }

  closeCertificationModal() {
    this.showCertificationModal = false;
    this.editingCertificationId = null;
  }

  saveCertification() {
    if (!this.certificationForm.name || !this.certificationForm.issuingOrg || !this.certificationForm.issueDate) {
      alert('Certification Name, Issuing Organization, and Issue Date are required');
      return;
    }

    if (this.editingCertificationId) {
      const index = this.certificationList.findIndex(c => c.id === this.editingCertificationId);
      if (index !== -1) {
        this.certificationList[index] = { ...this.certificationForm };
      }
    } else {
      const newCert: Certification = {
        ...this.certificationForm,
        id: Math.max(...this.certificationList.map(c => c.id), 0) + 1
      };
      this.certificationList.push(newCert);
    }

    this.closeCertificationModal();
  }

  deleteCertification(id: number) {
    if (confirm('Are you sure you want to delete this certification?')) {
      this.certificationList = this.certificationList.filter(c => c.id !== id);
    }
  }

  // Document methods
  openAddDocumentModal() {
    this.editingDocumentId = null;
    this.documentForm = {
      id: 0,
      type: '',
      fileName: '',
      uploadDate: new Date().toISOString().split('T')[0],
      description: ''
    };
    this.showDocumentModal = true;
  }

  openEditDocumentModal(doc: Document) {
    this.editingDocumentId = doc.id;
    this.documentForm = { ...doc };
    this.showDocumentModal = true;
  }

  closeDocumentModal() {
    this.showDocumentModal = false;
    this.editingDocumentId = null;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.documentForm.fileName = file.name;
    }
  }

  saveDocument() {
    if (!this.documentForm.type || !this.documentForm.fileName) {
      alert('Document Type and File are required');
      return;
    }

    if (this.editingDocumentId) {
      const index = this.documentList.findIndex(d => d.id === this.editingDocumentId);
      if (index !== -1) {
        this.documentList[index] = { ...this.documentForm };
      }
    } else {
      const newDoc: Document = {
        ...this.documentForm,
        id: Math.max(...this.documentList.map(d => d.id), 0) + 1
      };
      this.documentList.push(newDoc);
    }

    this.closeDocumentModal();
  }

  deleteDocument(id: number) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentList = this.documentList.filter(d => d.id !== id);
    }
  }

  // Save employee
  saveEmployee() {
    if (!this.employeeForm.fullName || !this.employeeForm.email || !this.employeeForm.joiningDate || 
        !this.employeeForm.position || !this.employeeForm.department || !this.employeeForm.employmentStatus) {
      alert('Please fill in all required fields');
      return;
    }

    // In real app, this would be an API call
    alert('Employee saved successfully!');
    this.router.navigate(['/hr-employees']);
  }

  cancel() {
    this.router.navigate(['/hr-employees']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}









