import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { PositionService } from '../../services/position.service';

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private positionService = inject(PositionService);

  isSidebarCollapsed = false;
  isEditMode = false;
  employeeId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

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
    position_id: null as number | null,
    department_id: null as number | null,
    reporting_manager_id: null as number | null,
    employmentStatus: 'Active',
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

  // Dropdown options - loaded from API
  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  positions: any[] = [];
  departments: any[] = [];
  employees: any[] = []; // For reporting manager dropdown
  statusOptions = ['Active', 'On Leave', 'Terminated'];
  gradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  documentTypeOptions = ['Resume', 'ID Proof', 'Certificate', 'Other'];

  ngOnInit() {
    this.loadDropdowns();
    
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      this.isEditMode = !!this.employeeId;
      
      if (this.isEditMode) {
        this.loadEmployeeData(this.employeeId!);
      } else {
        // For new employees, don't pre-fill employeeId - backend will auto-generate
        this.employeeForm.employeeId = ''; // Will show as empty/readonly
      }
    });
  }

  loadDropdowns() {
    // Load departments
    this.departmentService.getAllDepartments().subscribe({
      next: (depts: any[]) => {
        this.departments = depts;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });

    // Load positions
    this.positionService.getAllPositions().subscribe({
      next: (positions: any[]) => {
        this.positions = positions;
      },
      error: (error) => {
        console.error('Error loading positions:', error);
      }
    });

    // Load employees for reporting manager dropdown
    this.employeeService.getAllEmployees(true).subscribe({
      next: (employees: any[]) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  loadEmployeeData(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Convert string ID to number
    const employeeIdNum = parseInt(id.replace('EMP', ''), 10);
    
    this.employeeService.getEmployeeById(employeeIdNum).subscribe({
      next: (employee: any) => {
        this.employeeForm = {
          employeeId: employee.employee_id,
          fullName: employee.full_name,
          dateOfBirth: employee.date_of_birth || '',
          gender: employee.gender || '',
          email: employee.email,
          phone: employee.phone || '',
          address: employee.address || '',
          joiningDate: employee.joining_date || '',
          position_id: employee.position_id,
          department_id: employee.department_id,
          reporting_manager_id: employee.reporting_manager_id,
          employmentStatus: employee.employment_status || 'Active',
          salaryGrade: employee.salary_grade || '',
          linkedUser: employee.user?.id || ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.errorMessage = 'Failed to load employee data.';
        this.isLoading = false;
      }
    });
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
    if (!this.employeeForm.fullName || !this.employeeForm.email || !this.employeeForm.joiningDate) {
      this.errorMessage = 'Full Name, Email, and Joining Date are required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: any = {
      full_name: this.employeeForm.fullName,
      email: this.employeeForm.email,
      joining_date: this.employeeForm.joiningDate,
      position_id: this.employeeForm.position_id || null,
      department_id: this.employeeForm.department_id || null,
      reporting_manager_id: this.employeeForm.reporting_manager_id || null,
      employment_status: this.employeeForm.employmentStatus || 'Active',
      is_active: this.employeeForm.employmentStatus === 'Active'
    };
    
    // DO NOT send employee_id for new employees - let backend auto-generate
    // Only send employee_id if editing and we want to keep the existing one

    // Optional fields
    if (this.employeeForm.dateOfBirth) {
      payload.date_of_birth = this.employeeForm.dateOfBirth;
    }
    if (this.employeeForm.gender) {
      payload.gender = this.employeeForm.gender;
    }
    if (this.employeeForm.phone) {
      payload.phone = this.employeeForm.phone;
    }
    if (this.employeeForm.address) {
      payload.address = this.employeeForm.address;
    }
    if (this.employeeForm.salaryGrade) {
      payload.salary_grade = this.employeeForm.salaryGrade;
    }

    if (this.isEditMode && this.employeeId) {
      // Update existing employee
      const employeeIdNum = parseInt(this.employeeId.replace('EMP', ''), 10);
      this.employeeService.updateEmployee(employeeIdNum, payload).subscribe({
        next: () => {
          this.successMessage = 'Employee updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/hr-employees']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          this.errorMessage = error.error?.error || 'Failed to update employee. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      // Create new employee
      this.employeeService.createEmployee(payload).subscribe({
        next: () => {
          this.successMessage = 'Employee created successfully!';
          setTimeout(() => {
            this.router.navigate(['/hr-employees']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error creating employee:', error);
          this.errorMessage = error.error?.error || 'Failed to create employee. Please try again.';
          this.isLoading = false;
        }
      });
    }
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









