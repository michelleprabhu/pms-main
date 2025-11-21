# Phase 6: Permission Management UI

## 🎯 Goal
Create a UI for HR Admin to manage role-permission assignments without code changes.

## 📋 What We'll Build

### 1. Permission Management Component
- **Route**: `/hr-management/permissions` or add as 4th card on HR Management page
- **Access**: Only users with `manage_permissions` permission (HR Admin/User Admin)

### 2. UI Features
- **List all roles** (HR Admin, Manager, Employee, User Admin, External User)
- **For each role**, show:
  - Role name and description
  - List of assigned permissions (grouped by category)
  - Checkboxes to assign/unassign permissions
- **Permission categories**:
  - Pages (view_*_page)
  - Actions (create_*, edit_*, delete_*, manage_*)
  - HR Management specific
- **Save button** to update role permissions
- **Visual feedback** (success/error messages)

### 3. Backend Integration
- Use existing endpoints:
  - `GET /api/permissions` - List all permissions
  - `GET /api/roles/<id>/permissions` - Get role permissions
  - `PUT /api/roles/<id>/permissions` - Update role permissions

## 🎨 UI Design
- Add 4th card to HR Management page: "Permission Management"
- Clicking opens a modal or new page with:
  - Role selector (tabs or dropdown)
  - Permission list grouped by category
  - Checkboxes for each permission
  - Save button

## ✅ Benefits
- No code changes needed to adjust permissions
- HR can enable/disable features for roles dynamically
- Enterprise-ready RBAC system

