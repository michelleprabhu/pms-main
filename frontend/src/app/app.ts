import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);

  ngOnInit() {
    // If user is already logged in, refresh permissions from backend
    // This ensures permissions are up-to-date even if localStorage has old data
    if (this.authService.isAuthenticated()) {
      this.permissionService.refreshPermissions().catch(err => {
        console.warn('Failed to refresh permissions on app init:', err);
      });
    }
  }
}
