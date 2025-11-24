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
      console.log('[App] User is authenticated, refreshing permissions...');
      this.permissionService.refreshPermissions().then(() => {
        console.log('[App] Permissions refreshed successfully');
      }).catch(err => {
        console.warn('[App] Failed to refresh permissions on app init:', err);
        // If refresh fails, try to load from localStorage as fallback
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.permissions && Array.isArray(user.permissions)) {
              this.permissionService.setPermissions(user.permissions);
              console.log('[App] Loaded permissions from localStorage as fallback');
            }
          } catch (e) {
            console.error('[App] Error parsing user from localStorage:', e);
          }
        }
      });
    } else {
      console.log('[App] User is not authenticated');
    }
  }
}
