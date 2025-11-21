# Employee Permissions Checklist

## ✅ Employee Routes in Frontend

| Route | Component | Permission Required | Status |
|-------|-----------|-------------------|--------|
| `/employee-dashboard` | EmployeeDashboard | `view_employee_dashboard` | ✅ Protected |
| `/employee-score-cards` | EmployeeScoreCardsComponent | `view_employee_scorecards` | ✅ Protected |
| `/employee-score-card-details` | EmployeeScoreCardDetailsComponent | `view_employee_scorecards` | ✅ Protected |
| `/employee-self-evaluation` | EmployeeSelfEvaluationComponent | `view_self_evaluation` | ✅ Protected |
| `/employee-self-evaluation-details` | EmployeeSelfEvaluationDetailsComponent | `view_self_evaluation` | ✅ Protected |
| `/employee-ratings` | EmployeeRatingsComponent | `view_employee_ratings` | ✅ Protected (FIXED) |
| `/employee-ratings-details` | EmployeeRatingsDetailsComponent | `view_employee_ratings` | ✅ Protected (FIXED) |
| `/employee-my-profile` | EmployeeMyProfileComponent | None | ⚠️ Not protected (may be intentional) |

## ✅ Employee Permissions (After Fix)

Employee role now has **4 permissions**:

1. ✅ `view_employee_dashboard` - Access to employee dashboard
2. ✅ `view_employee_scorecards` - Access to own score cards
3. ✅ `view_self_evaluation` - Access to self evaluation
4. ✅ `view_employee_ratings` - Access to employee ratings (ADDED)

## 🔍 Verification Steps

### 1. Test Employee Login
```bash
curl -X POST http://localhost:5002/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@pms.com","password":"employee123"}' \
  | jq '.user.permissions'
```

**Expected**: Array with 4 permissions including `view_employee_ratings`

### 2. Test in Browser
1. Login as employee
2. Check console: `JSON.parse(localStorage.getItem('user')).permissions`
3. Should see 4 permissions including `view_employee_ratings`
4. Navigate to `/employee-ratings` - should work
5. Navigate to `/employee-dashboard` - should work
6. Navigate to `/employee-score-cards` - should work
7. Navigate to `/employee-self-evaluation` - should work

### 3. Test Route Protection
- Try accessing `/planning` (HR only) - should redirect to login
- Try accessing `/hr-management` (HR only) - should redirect to login
- All employee routes should be accessible

## 📋 All Role Permissions Summary

### HR Admin (33 permissions)
- All page-level permissions
- All action-level permissions
- Permission management

### Manager (12 permissions)
- Manager dashboard
- Score cards (team view)
- Evaluations
- Goals management
- Team employee view

### Employee (4 permissions) ✅ FIXED
- Employee dashboard
- Own score cards
- Self evaluation
- Ratings ✅ ADDED

## 🎯 Next Steps

1. ✅ Add `view_employee_ratings` permission - DONE
2. ✅ Add permission to Employee role - DONE
3. ✅ Add route guards to employee-ratings routes - DONE
4. ⏭️ Test all employee routes work correctly
5. ⏭️ Update navigation/sidebars (Phase 5)
6. ⏭️ Test permission checks in UI components

