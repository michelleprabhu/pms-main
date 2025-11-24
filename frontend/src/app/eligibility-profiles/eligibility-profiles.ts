import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PermissionService } from '../../services/permission.service';

interface EligibilityProfile {
  id: number;
  profile_name: string;
  description: string;
  department: string;
  position_criteria: string;
  matching_employees: number;
  is_active: boolean;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

interface Position {
  id: number;
  title: string;
  department_id?: number;
  department_name?: string;
  grade_level?: string;
}

@Component({
  selector: 'app-eligibility-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eligibility-profiles.html',
  styleUrls: ['./eligibility-profiles.css']
})
export class EligibilityProfilesComponent implements OnInit {
  private apiUrl = 'http://localhost:5003/api';

  profiles: EligibilityProfile[] = [];
  departments: Department[] = [];
  positions: Position[] = [];
  
  showCreateModal = false;
  isCreating = false;
  createError = '';
  
  selectedPositions: Set<number> = new Set();
  
  newProfile = {
    profile_name: '',
    description: '',
    department_filter: '',
    position_criteria: '',
    is_active: true
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.loadProfiles();
    this.loadDepartments();
    this.loadPositions();
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  loadProfiles() {
    this.http.get<any[]>(`${this.apiUrl}/eligibility-profiles`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.profiles = data.map(profile => ({
          id: profile.id,
          profile_name: profile.profile_name,
          description: profile.description || '',
          department: profile.department || 'All',
          position_criteria: profile.position_criteria || 'All',
          matching_employees: profile.matching_employees || 0,
          is_active: profile.is_active !== false
        }));
      },
      error: (err) => {
        console.error('Failed to load eligibility profiles', err);
      }
    });
  }

  loadDepartments() {
    this.http.get<Department[]>(`${this.apiUrl}/departments`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.departments = data || [];
      },
      error: (err) => {
        console.error('Failed to load departments', err);
      }
    });
  }

  loadPositions() {
    this.http.get<Position[]>(`${this.apiUrl}/positions`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.positions = data || [];
      },
      error: (err) => {
        console.error('Failed to load positions', err);
      }
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.createError = '';
    this.selectedPositions.clear();
    this.newProfile = {
      profile_name: '',
      description: '',
      department_filter: '',
      position_criteria: '',
      is_active: true
    };
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.createError = '';
    this.selectedPositions.clear();
    this.newProfile = {
      profile_name: '',
      description: '',
      department_filter: '',
      position_criteria: '',
      is_active: true
    };
  }

  togglePosition(positionId: number) {
    if (this.selectedPositions.has(positionId)) {
      this.selectedPositions.delete(positionId);
    } else {
      this.selectedPositions.add(positionId);
    }
  }

  isPositionSelected(positionId: number): boolean {
    return this.selectedPositions.has(positionId);
  }

  getSelectedPositionTitles(): string[] {
    return this.positions
      .filter(p => this.selectedPositions.has(p.id))
      .map(p => p.title);
  }

  createProfile() {
    if (!this.newProfile.profile_name || !this.newProfile.profile_name.trim()) {
      this.createError = 'Profile name is required';
      return;
    }

    this.isCreating = true;
    this.createError = '';

    // Build position criteria from selected positions
    // If no positions selected, use "All" (matching seed data format)
    let positionCriteria = 'All';
    if (this.selectedPositions.size > 0) {
      const selectedTitles = this.getSelectedPositionTitles();
      positionCriteria = selectedTitles.join('|');
    }

    // Department filter: if empty, use "All" (matching seed data format)
    const departmentFilter = this.newProfile.department_filter && this.newProfile.department_filter.trim() !== '' 
      ? this.newProfile.department_filter.trim() 
      : 'All';

    const payload = {
      profile_name: this.newProfile.profile_name.trim(),
      description: this.newProfile.description && this.newProfile.description.trim() !== '' 
        ? this.newProfile.description.trim() 
        : null,
      department_filter: departmentFilter,
      position_criteria: positionCriteria,
      is_active: this.newProfile.is_active
    };

    console.log('Creating profile with payload:', payload);
    console.log('Selected positions count:', this.selectedPositions.size);
    console.log('Selected position IDs:', Array.from(this.selectedPositions));

    this.http.post<any>(`${this.apiUrl}/eligibility-profiles`, payload, { 
      headers: this.getHeaders().set('Content-Type', 'application/json')
    }).subscribe({
      next: (response) => {
        this.isCreating = false;
        this.closeCreateModal();
        this.loadProfiles(); // Refresh list
        console.log('Profile created successfully:', response);
      },
      error: (err) => {
        this.isCreating = false;
        console.error('Failed to create eligibility profile', err);
        console.error('Error details:', err.error);
        this.createError = err.error?.error || 'Failed to create profile. Please try again.';
      }
    });
  }

  navigateBack() {
    this.router.navigate(['/planning']);
  }

  formatPositionCriteria(criteria: string): string {
    if (!criteria || criteria === 'All') return 'All Positions';
    return criteria.split('|').join(', ');
  }
}

