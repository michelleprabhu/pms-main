# RBAC Permissions System - Testing Guide

## ✅ Servers Status
- **Backend**: Running on http://localhost:5002 ✅
- **Frontend**: Running on http://localhost:4300 ✅

## 🧪 Testing Steps

### Option 1: Automated Test Script (Recommended)

Run the test script with your credentials:

```bash
./test_permissions.sh <your-email> <your-password>
```

Example:
```bash
./test_permissions.sh hr@example.com yourpassword
```

This will test:
1. Login and token retrieval
2. Permissions in login response
3. Current user endpoint with permissions
4. Permission-protected endpoints
5. Role permissions endpoint
6. User permissions endpoint

### Option 2: Manual Testing with cURL

#### Step 1: Login and Get Token
```bash
TOKEN=$(curl -s -X POST http://localhost:5002/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

#### Step 2: Check Permissions in Login Response
```bash
curl -s -X POST http://localhost:5002/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}' \
  | jq '.user.permissions'
```

#### Step 3: Test Current User Endpoint (should include permissions)
```bash
curl -s http://localhost:5002/api/current-user \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.permissions'
```

#### Step 4: Test Permission-Protected Endpoint
```bash
# This requires 'manage_permissions' permission (HR Admin/User Admin only)
curl -s http://localhost:5002/api/permissions \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.permissions | length'
```

#### Step 5: Get Role Permissions
```bash
# Replace ROLE_ID with your role_id (usually 2 for HR Admin)
curl -s http://localhost:5002/api/roles/2/permissions \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.permission_codes'
```

#### Step 6: Get User Permissions
```bash
# Replace USER_ID with your user_id
curl -s http://localhost:5002/api/users/1/permissions \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.permission_codes'
```

### Option 3: Frontend Browser Testing

1. **Open Browser**: Navigate to http://localhost:4300

2. **Login**: Use your credentials
   - Check browser console (F12) for:
     - Login response should include `permissions` array
     - Example: `{ token: "...", user: { ..., permissions: ["view_planning_page", ...] } }`

3. **Test Route Protection**:
   - Try accessing `/planning` - should work if you have `view_planning_page` permission
   - Try accessing `/hr-management` - should work if you have `view_hr_management_page` permission
   - If you don't have permission, you'll be redirected to login

4. **Check Navigation**:
   - HR Dashboard sidebar should show links based on permissions
   - Links without permissions should be hidden (we'll update this in next phase)

5. **Test Permission Checks**:
   - Open browser console
   - Type: `localStorage.getItem('user')` and check if `permissions` array is present
   - Type: `JSON.parse(localStorage.getItem('user')).permissions`

## 📋 Expected Results

### For HR Admin (Role ID: 2)
- Should have **33 permissions** including:
  - `view_planning_page`
  - `view_scorecards_page`
  - `view_hr_management_page`
  - `create_review_period`
  - `generate_score_cards`
  - `manage_permissions`
  - And many more...

### For Manager (Role ID: 3)
- Should have **12 permissions** including:
  - `view_manager_dashboard`
  - `view_scorecards_page`
  - `view_team_score_cards`
  - `create_goal`
  - `edit_goal`

### For Employee (Role ID: 4)
- Should have **3 permissions**:
  - `view_employee_dashboard`
  - `view_employee_scorecards`
  - `view_self_evaluation`

## 🔍 Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend compiles and serves
- [ ] Login returns token and user with permissions array
- [ ] `/api/current-user` returns permissions
- [ ] `/api/permissions` endpoint works (for users with `manage_permissions`)
- [ ] `/api/roles/<id>/permissions` returns role permissions
- [ ] Route guards work (protected routes redirect if no permission)
- [ ] Permissions are stored in localStorage after login

## 🐛 Troubleshooting

### Issue: "No permissions in login response"
- Check backend logs: `tail -f backend.log`
- Verify permissions were seeded: Check database `permissions` table
- Verify role-permission mappings: Check `role_permissions` table

### Issue: "Route guard redirects even with permission"
- Check browser console for permission errors
- Verify permissions are in localStorage: `localStorage.getItem('user')`
- Check that permission codes match exactly (case-sensitive)

### Issue: "Backend returns 403 on permission-protected endpoint"
- Verify user's role has the required permission
- Check `role_permissions` table for your role_id
- Verify permission code matches exactly

## 📊 Database Verification

To check permissions in database:

```sql
-- Check all permissions
SELECT * FROM permissions WHERE deleted_at IS NULL;

-- Check role-permission mappings
SELECT r.role_name, p.code, p.name
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.deleted_at IS NULL AND p.deleted_at IS NULL
ORDER BY r.role_name, p.category, p.code;

-- Check user's permissions (via role)
SELECT u.email, r.role_name, p.code
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'YOUR_EMAIL'
  AND u.deleted_at IS NULL
  AND r.deleted_at IS NULL
  AND p.deleted_at IS NULL;
```

## 🎯 Next Steps After Testing

Once everything works:
1. Update navigation/sidebars to use permission checks
2. Create permission management UI (optional)
3. Gradually migrate more endpoints to use permissions
4. Remove role checks once permissions are fully tested

