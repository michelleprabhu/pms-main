/**
 * Role Constants - Centralized role definitions
 * Instead of hardcoding role_id values, use these constants.
 * If role IDs change in database, update these constants.
 */

export enum RoleID {
  USER_ADMIN = 1,      // IT Admin - System administrator
  HR_ADMIN = 2,        // HR Admin - HR management
  MANAGER = 3,         // Manager - Team management
  EMPLOYEE = 4,        // Employee - Self-service
  EXTERNAL_USER = 5    // External User - Limited access
}

// Role name mappings
export const ROLE_NAMES: { [key: string]: RoleID } = {
  'User Admin': RoleID.USER_ADMIN,
  'HR Admin': RoleID.HR_ADMIN,
  'Manager': RoleID.MANAGER,
  'Employee': RoleID.EMPLOYEE,
  'External User': RoleID.EXTERNAL_USER,
};

// Reverse mapping (role_id -> role_name)
export const ROLE_ID_TO_NAME: { [key: number]: string } = {
  [RoleID.USER_ADMIN]: 'User Admin',
  [RoleID.HR_ADMIN]: 'HR Admin',
  [RoleID.MANAGER]: 'Manager',
  [RoleID.EMPLOYEE]: 'Employee',
  [RoleID.EXTERNAL_USER]: 'External User',
};

// Dashboard routes by role
export const ROLE_DASHBOARD_ROUTES: { [key: number]: string } = {
  [RoleID.USER_ADMIN]: '',  // No frontend yet
  [RoleID.HR_ADMIN]: '/hr-dashboard',
  [RoleID.MANAGER]: '/manager-dashboard',
  [RoleID.EMPLOYEE]: '/employee-dashboard',
  [RoleID.EXTERNAL_USER]: '',  // No frontend yet
};



