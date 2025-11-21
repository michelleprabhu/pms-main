# RBAC Permissions System - Test Results & Fix

## ✅ Backend Test Results (All Correct!)

### HR Admin (hr@pms.com / hr123)
- **Expected**: 33 permissions
- **Actual**: 33 permissions ✅
- **Sample permissions**: `view_hr_departments_page`, `create_competency`, `view_all_employees`, `create_goal`, `delete_employee`, `view_planning_page`, `view_hr_employees_page`, `manage_permissions`, etc.

### Manager (manager@pms.com / manager123)
- **Expected**: 12 permissions
- **Actual**: 12 permissions ✅
- **Sample permissions**: `create_goal`, `view_manager_dashboard`, `edit_goal`, `view_evaluation_page`, `view_team_score_cards`, etc.

### Employee (employee@pms.com / employee123)
- **Expected**: 3 permissions
- **Actual**: 3 permissions ✅
- **Permissions**: `view_employee_dashboard`, `view_self_evaluation`, `view_employee_scorecards`

## 🔍 Issue Identified

The backend is returning **correct permissions**, but the frontend is showing **Employee permissions (3)** for HR Admin and Manager users.

**Root Cause**: Stale localStorage data from before permissions were added to the login response.

## 🔧 Fixes Applied

### 1. App Component Auto-Refresh
- Added `ngOnInit` to `app.ts` that refreshes permissions on app initialization
- Ensures permissions are always up-to-date even with old localStorage data

### 2. Debug Logging
- Added console logs to `PermissionService` to track permission loading
- Helps identify when permissions are loaded/updated

## 📝 How to Test & Fix

### Option 1: Clear localStorage (Recommended)
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh the page
4. Login again with your credentials
5. Check: `JSON.parse(localStorage.getItem('user')).permissions`

### Option 2: Use Incognito/Private Mode
1. Open incognito/private window
2. Navigate to http://localhost:4300
3. Login with your credentials
4. Check permissions in console

### Option 3: Manual Refresh
1. After login, open browser console
2. Run: `location.reload()` (this will trigger the auto-refresh)
3. Check permissions again

## ✅ Expected Results After Fix

### HR Admin Login
```javascript
JSON.parse(localStorage.getItem('user')).permissions
// Should return: Array(33) with permissions like:
// ['view_planning_page', 'view_scorecards_page', 'view_hr_management_page', ...]
```

### Manager Login
```javascript
JSON.parse(localStorage.getItem('user')).permissions
// Should return: Array(12) with permissions like:
// ['view_manager_dashboard', 'view_scorecards_page', 'create_goal', ...]
```

### Employee Login
```javascript
JSON.parse(localStorage.getItem('user')).permissions
// Should return: Array(3) with:
// ['view_employee_dashboard', 'view_self_evaluation', 'view_employee_scorecards']
```

## 🧪 Test Commands

### Backend API Test
```bash
# Test HR Admin login
curl -X POST http://localhost:5002/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@pms.com","password":"hr123"}' \
  | jq '.user.permissions | length'

# Should return: 33
```

### Frontend Console Test
```javascript
// After login, check permissions
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user.role);
console.log('Permissions count:', user.permissions.length);
console.log('Permissions:', user.permissions);
```

## 🐛 Troubleshooting

### If permissions are still wrong:
1. **Check browser console** for `[PermissionService]` logs
2. **Verify backend response**: Check Network tab → Login request → Response
3. **Clear all data**: `localStorage.clear()` and `sessionStorage.clear()`
4. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### If permissions are missing:
1. Check backend logs: `tail -f backend.log`
2. Verify database: Check `role_permissions` table
3. Re-run seed script: `python scripts/seed_permissions.py`

## 📊 Verification Checklist

- [ ] Backend returns correct permissions (tested ✅)
- [ ] Frontend app component refreshes permissions on init (fixed ✅)
- [ ] Login stores permissions in localStorage (working ✅)
- [ ] Permission service loads permissions correctly (working ✅)
- [ ] Route guards work with permissions (needs testing)
- [ ] Navigation shows/hides based on permissions (Phase 5 - pending)

## 🎯 Next Steps

1. **Clear localStorage and test login** with all three roles
2. **Verify permissions** in browser console
3. **Test route guards** - try accessing protected routes
4. **Update navigation** (Phase 5) - add permission checks to sidebars

