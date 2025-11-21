# Phase 5: Safe Navigation Update Plan

## ✅ Current Status (Verified)
- Employee: 4 permissions ✅
- Manager: 12 permissions ✅
- HR: 33 permissions ✅
- All route guards working ✅

## 🛡️ Safety Strategy

### Why This Won't Break Anything:
1. **Additive Changes Only**: We're adding `*ngIf` checks, not removing code
2. **Backward Compatible**: If permission check fails, link just won't show (safe)
3. **Incremental**: One dashboard at a time, test after each
4. **Easy Rollback**: Git commit after each dashboard, can revert easily
5. **Non-Breaking**: Navigation still works, just shows/hides based on permissions

### What We're Doing:
- **Before**: All links always visible
- **After**: Links visible only if user has permission
- **If permission missing**: Link hidden (user can't click what they can't see)
- **Route guards already protect**: Even if they navigate directly, route guard blocks them

## 📋 Incremental Plan

### Step 1: Employee Dashboard (Safest - Already Mostly Correct)
- Add `*ngIf` to Ratings link (already has permission)
- Verify all 4 links show for employee
- Test: Login as employee, check sidebar

### Step 2: Manager Dashboard (Simple - Only 2 Links)
- Add `*ngIf` to Score Cards link
- Add `*ngIf` to Evaluation link
- Test: Login as manager, check sidebar

### Step 3: HR Dashboard (More Links, But Still Safe)
- Add `*ngIf` to Planning link
- Add `*ngIf` to Score Cards link
- Add `*ngIf` to Evaluation link
- Add `*ngIf` to Management link
- Add `*ngIf` to Review Periods link
- Test: Login as HR, check sidebar

## 🔍 Testing After Each Step

After updating each dashboard:
1. ✅ Login with that role
2. ✅ Check sidebar shows correct links
3. ✅ Click each link - should work
4. ✅ Try direct URL access - route guard should protect
5. ✅ Check browser console for errors

## 🚨 Safety Net

- **Git commits**: After each dashboard update
- **Can revert**: If anything breaks, just `git revert`
- **No data loss**: Only UI changes, no database changes
- **Route guards**: Already protect routes, navigation is just UX

## ✅ Ready to Proceed?

I'll do it one dashboard at a time, test after each, and commit so we can revert if needed.

