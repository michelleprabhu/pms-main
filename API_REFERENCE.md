# Score Card Planning API Reference - Complete Documentation

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

**Get Token:**
```bash
POST /api/login
Content-Type: application/json

{
  "email": "hr@pms.com",
  "password": "hr123"
}
```

---

## HR Planning Feature Endpoints

### 1. Get Eligibility Profiles

**Endpoint:** `GET /api/eligibility-profiles`

**Authentication:** Required (HR Admin only)

**Description:** Returns all active eligibility profiles with matching employee counts. Automatically excludes the logged-in HR Admin from employee counts.

**Request:**
```http
GET /api/eligibility-profiles
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "profile_name": "Manager Profile",
    "description": "All employees in managerial positions across departments",
    "department": "All",
    "position_criteria": "Manager|Director|Lead|Head",
    "matching_employees": 2
  },
  {
    "id": 2,
    "profile_name": "Software Developer Profile",
    "description": "Engineering team developers and programmers",
    "department": "IT",
    "position_criteria": "Software Developer|Engineer|Developer|Programmer",
    "matching_employees": 1
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not HR Admin

**Business Logic:**
- Only returns active profiles (`is_active=true`, `deleted_at=NULL`)
- Employee counts exclude the logged-in HR Admin's employee record
- Counts are calculated in real-time based on current employee data

---

### 2. Generate Empty Score Cards

**Endpoint:** `POST /api/planning/generate-score-cards`

**Authentication:** Required (HR Admin only)

**Description:** Bulk creates empty score cards for employees matching selected eligibility profiles. Automatically excludes HR Admin from generation.

**Request:**
```http
POST /api/planning/generate-score-cards
Authorization: Bearer <token>
Content-Type: application/json

{
  "review_period_id": 2,
  "profile_ids": [1, 2, 3]
}
```

**Request Body Fields:**
- `review_period_id` (Integer, required) - ID of the review period
- `profile_ids` (Array of Integers, required) - Array of eligibility profile IDs to use

**Response (201 Created):**
```json
{
  "message": "Created 2 new score cards",
  "count": 2,
  "employees": [
    {
      "id": 2,
      "name": "Team Manager",
      "department": "Management",
      "position": "Team Manager",
      "score_card_id": 4
    },
    {
      "id": 3,
      "name": "Regular Employee",
      "department": "IT",
      "position": "Software Developer",
      "score_card_id": 5
    }
  ],
  "already_existed": false
}
```

**Response (201 Created) - If Some Already Exist:**
```json
{
  "message": "Score cards already exist for 2 employees. Created 0 new ones.",
  "count": 2,
  "employees": [
    {
      "id": 2,
      "name": "Team Manager",
      "department": "Management",
      "position": "Team Manager",
      "score_card_id": 4
    }
  ],
  "already_existed": true
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
  ```json
  {
    "error": "Missing required fields: review_period_id and profile_ids"
  }
  ```
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not HR Admin
- `404 Not Found` - Review period doesn't exist

**Business Logic:**
1. Collects all unique employee IDs matching selected profiles
2. Excludes logged-in HR Admin's employee_id
3. Checks for existing score cards (employee_id + review_period_id)
4. Creates new score cards with:
   - `status = 'planning'`
   - `goals_weightage = 60` (default)
   - `competencies_weightage = 25` (default)
   - `values_weightage = 15` (default)
5. Returns both newly created and existing score cards

**Duplicate Handling:**
- If score card already exists for employee+period, it's skipped
- Response includes all relevant employees (new + existing)

---

### 3. Get Active Review Periods

**Endpoint:** `GET /api/review-periods/active`

**Authentication:** Required

**Description:** Returns all active review periods with employee count (number of score cards created).

**Request:**
```http
GET /api/review-periods/active
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "name": "Q1 2025",
    "startDate": "Jan 1, 2025",
    "endDate": "Mar 31, 2025",
    "status": "Active",
    "employeeCount": 2
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

**Business Logic:**
- Only returns periods where `is_active=true` and `deleted_at=NULL`
- `employeeCount` = number of score cards for that period (excluding deleted)

---

## Goals Management Endpoints

### 4. List Score Cards

**Endpoint:** `GET /api/score-cards`

**Authentication:** Required

**Description:** Returns all score cards, optionally filtered by review period.

**Request:**
```http
GET /api/score-cards?review_period_id=2
Authorization: Bearer <token>
```

**Query Parameters:**
- `review_period_id` (Integer, optional) - Filter by review period ID

**Response (200 OK):**
```json
[
  {
    "id": 4,
    "employee_id": 2,
    "review_period_id": 2,
    "status": "planning",
    "employee": {
      "id": 2,
      "full_name": "Team Manager",
      "email": "manager@pms.com",
      "department": {
        "id": 2,
        "name": "Management"
      },
      "position": {
        "id": 2,
        "title": "Team Manager"
      }
    }
  },
  {
    "id": 5,
    "employee_id": 3,
    "review_period_id": 2,
    "status": "planning",
    "employee": {
      "id": 3,
      "full_name": "Regular Employee",
      "email": "employee@pms.com",
      "department": {
        "id": 3,
        "name": "IT"
      },
      "position": {
        "id": 3,
        "title": "Software Developer"
      }
    }
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

**Business Logic:**
- Only returns non-deleted score cards (`deleted_at=NULL`)
- Includes full employee details with department and position
- If `review_period_id` not provided, returns all score cards

---

### 5. Get Weightage Distribution

**Endpoint:** `GET /api/score-cards/<score_card_id>/weightage`

**Authentication:** Required

**Description:** Returns current weightage distribution for a score card.

**Request:**
```http
GET /api/score-cards/4/weightage
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "score_card_id": 4,
  "goals_weightage": 60,
  "competencies_weightage": 25,
  "values_weightage": 15,
  "total": 100
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Score card doesn't exist
  ```json
  {
    "error": "Score card not found"
  }
  ```

**Business Logic:**
- Returns current weightage values (defaults: 60/25/15 if null)
- `total` is calculated sum for validation

---

### 6. Update Weightage Distribution

**Endpoint:** `PUT /api/score-cards/<score_card_id>/weightage`

**Authentication:** Required (HR Admin only)

**Description:** Updates weightage distribution. Total must equal exactly 100%.

**Request:**
```http
PUT /api/score-cards/4/weightage
Authorization: Bearer <token>
Content-Type: application/json

{
  "goals_weightage": 70,
  "competencies_weightage": 20,
  "values_weightage": 10
}
```

**Request Body Fields:**
- `goals_weightage` (Integer, required) - Percentage for goals (0-100)
- `competencies_weightage` (Integer, required) - Percentage for competencies (0-100)
- `values_weightage` (Integer, required) - Percentage for values (0-100)

**Response (200 OK):**
```json
{
  "message": "Weightage updated successfully",
  "goals_weightage": 70,
  "competencies_weightage": 20,
  "values_weightage": 10
}
```

**Error Responses:**
- `400 Bad Request` - Missing fields or invalid total
  ```json
  {
    "error": "All three weightages (goals, competencies, values) are required"
  }
  ```
  ```json
  {
    "error": "Weightages must total 100%. Current total: 95%"
  }
  ```
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not HR Admin
- `404 Not Found` - Score card doesn't exist

**Business Logic:**
- All three weightages are required
- Total must equal exactly 100% (not 99% or 101%)
- Updates `updated_by` field with current user ID
- Only HR Admin can update weightage

---

### 7. Get Goals for Score Card

**Endpoint:** `GET /api/score-cards/<score_card_id>/goals`

**Authentication:** Required

**Description:** Returns all goals for a score card with planning progress breakdown by role.

**Request:**
```http
GET /api/score-cards/4/goals
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "score_card_id": 4,
  "goals_weightage": 60,
  "goals": [
    {
      "id": 1,
      "goal_name": "Increase Sales Revenue",
      "description": "Achieve 20% growth in quarterly sales",
      "success_criteria": "Revenue increases by $500K and meets or exceeds 20% growth target",
      "weight": 30,
      "added_by_role": "HR",
      "added_by_user": {
        "id": 2,
        "email": "hr@pms.com",
        "username": "hr"
      },
      "start_date": "2025-01-01",
      "end_date": "2025-03-31",
      "deadline_date": "2025-03-31",
      "status": "active",
      "created_at": "2025-11-20T03:27:45.459422",
      "updated_at": "2025-11-20T03:27:45.459430",
      "deleted_at": null
    },
    {
      "id": 2,
      "goal_name": "Team Development",
      "description": "Conduct training sessions",
      "success_criteria": "Complete 8 training sessions",
      "weight": 15,
      "added_by_role": "Manager",
      "added_by_user": {
        "id": 3,
        "email": "manager@pms.com",
        "username": "manager"
      },
      "start_date": "2025-01-15",
      "end_date": "2025-03-15",
      "deadline_date": null,
      "status": "active",
      "created_at": "2025-11-20T04:00:00.000000",
      "updated_at": "2025-11-20T04:00:00.000000",
      "deleted_at": null
    }
  ],
  "planning_progress": {
    "HR": {
      "count": 1,
      "total_weight": 30
    },
    "Manager": {
      "count": 1,
      "total_weight": 15
    },
    "Employee": {
      "count": 0,
      "total_weight": 0
    },
    "total_weight": 45
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Score card doesn't exist

**Business Logic:**
- Only returns non-deleted goals (`deleted_at=NULL`)
- Auto-sets default weightage (60/25/15) if score card has null values
- Planning progress calculated in real-time:
  - Groups goals by `added_by_role`
  - Counts goals per role
  - Sums weights per role
  - Calculates total weight across all goals
- Includes full user details (email, username) for each goal

---

### 8. Add Goal to Score Card

**Endpoint:** `POST /api/score-cards/<score_card_id>/goals`

**Authentication:** Required

**Description:** Creates a new goal for a score card. Role is automatically extracted from JWT token.

**Request:**
```http
POST /api/score-cards/4/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "goal_name": "Increase Sales Revenue",
  "description": "Achieve 20% growth in quarterly sales",
  "success_criteria": "Revenue increases by $500K",
  "weight": 30,
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "deadline_date": "2025-03-31"
}
```

**Request Body Fields:**
- `goal_name` (String, required) - Name of the goal
- `description` (String, optional) - Detailed description
- `success_criteria` (String, optional) - Success criteria
- `weight` (Integer, required) - Percentage weight (0-100)
- `start_date` (String, optional) - Start date (YYYY-MM-DD format)
- `end_date` (String, optional) - End date (YYYY-MM-DD format)
- `deadline_date` (String, optional) - Deadline date (YYYY-MM-DD format)
- `status` (String, optional) - Status (default: "active")

**Auto-Populated Fields:**
- `added_by_role` - Extracted from JWT:
  - `'HR Admin'` → `'HR'`
  - `'Manager'` → `'Manager'`
  - `'Employee'` → `'Employee'`
- `added_by_user_id` - From JWT `user_id`
- `created_by` - From JWT `user_id`
- `updated_by` - From JWT `user_id`

**Response (201 Created):**
```json
{
  "message": "Goal added successfully",
  "goal": {
    "id": 1,
    "score_card_id": 4,
    "goal_name": "Increase Sales Revenue",
    "description": "Achieve 20% growth in quarterly sales",
    "success_criteria": "Revenue increases by $500K",
    "weight": 30,
    "added_by_role": "HR",
    "added_by_user": {
      "id": 2,
      "email": "hr@pms.com",
      "username": "hr"
    },
    "start_date": "2025-01-01",
    "end_date": "2025-03-31",
    "deadline_date": "2025-03-31",
    "status": "active",
    "created_at": "2025-11-20T03:27:45.459422",
    "updated_at": "2025-11-20T03:27:45.459430",
    "deleted_at": null
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or validation failed
  ```json
  {
    "error": "goal_name is required"
  }
  ```
  ```json
  {
    "error": "weight is required"
  }
  ```
  ```json
  {
    "error": "Total goal weight would exceed 60%. Current total: 50%, trying to add: 20%"
  }
  ```
  ```json
  {
    "error": "Invalid start_date format. Use YYYY-MM-DD"
  }
  ```
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Score card doesn't exist

**Business Logic:**
- Validates required fields (`goal_name`, `weight`)
- Validates date formats (YYYY-MM-DD)
- Validates total weight doesn't exceed `goals_weightage`:
  - Calculates sum of existing goal weights
  - Adds new goal weight
  - Must be ≤ `score_card.goals_weightage`
- Role mapping from JWT:
  - `'HR Admin'` → `'HR'`
  - `'Manager'` → `'Manager'`
  - `'Employee'` → `'Employee'`
  - Defaults to `'Employee'` if role not recognized

---

### 9. Update Goal

**Endpoint:** `PUT /api/goals/<goal_id>`

**Authentication:** Required

**Description:** Updates an existing goal. Supports partial updates.

**Request:**
```http
PUT /api/goals/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "goal_name": "Updated Goal Name",
  "weight": 35,
  "description": "Updated description"
}
```

**Request Body Fields (all optional):**
- `goal_name` (String) - Update goal name
- `description` (String) - Update description
- `success_criteria` (String) - Update success criteria
- `weight` (Integer) - Update weight (validated against total)
- `status` (String) - Update status
- `start_date` (String) - Update start date (YYYY-MM-DD)
- `end_date` (String) - Update end date (YYYY-MM-DD)
- `deadline_date` (String) - Update deadline date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "message": "Goal updated successfully",
  "goal": {
    "id": 1,
    "goal_name": "Updated Goal Name",
    "weight": 35,
    "description": "Updated description",
    "added_by_role": "HR",
    "added_by_user": {
      "id": 2,
      "email": "hr@pms.com",
      "username": "hr"
    },
    "start_date": "2025-01-01",
    "end_date": "2025-03-31",
    "status": "active",
    "created_at": "2025-11-20T03:27:45.459422",
    "updated_at": "2025-11-20T04:15:30.123456",
    "deleted_at": null
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed
  ```json
  {
    "error": "Total goal weight would exceed 60%"
  }
  ```
  ```json
  {
    "error": "Invalid start_date format. Use YYYY-MM-DD"
  }
  ```
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Goal doesn't exist or has been deleted
  ```json
  {
    "error": "Goal not found"
  }
  ```
  ```json
  {
    "error": "Goal has been deleted"
  }
  ```

**Business Logic:**
- Only updates fields provided in request (partial update)
- Weight validation:
  - Calculates total of other goals (excluding current goal)
  - Adds new weight
  - Must be ≤ `goals_weightage`
- Updates `updated_by` with current user ID
- Updates `updated_at` timestamp
- Cannot update deleted goals

---

### 10. Delete Goal

**Endpoint:** `DELETE /api/goals/<goal_id>`

**Authentication:** Required

**Description:** Soft deletes a goal (sets `deleted_at` timestamp).

**Request:**
```http
DELETE /api/goals/1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Goal deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Goal doesn't exist
  ```json
  {
    "error": "Goal not found"
  }
  ```
- `400 Bad Request` - Goal already deleted
  ```json
  {
    "error": "Goal already deleted"
  }
  ```

**Business Logic:**
- Soft delete (sets `deleted_at` to current timestamp)
- Goal is not physically removed from database
- Deleted goals are excluded from queries (`deleted_at=NULL` filter)
- Updates `updated_by` with current user ID

---

### 11. Send Score Card for Employee Acceptance

**Endpoint:** `POST /api/score-cards/<score_card_id>/send-for-acceptance`

**Authentication:** Required (HR Admin only)

**Description:** Sends score card to employee for acceptance. Validates that total goal weights equal `goals_weightage` exactly.

**Request:**
```http
POST /api/score-cards/4/send-for-acceptance
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Score card sent for employee acceptance",
  "score_card_id": 4,
  "status": "pending_acceptance"
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed
  ```json
  {
    "error": "Total goal weight must equal 60%. Current: 45%",
    "required": 60,
    "current": 45
  }
  ```
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not HR Admin
- `404 Not Found` - Score card doesn't exist

**Business Logic:**
- **Exact Match Required:** Total goal weights MUST equal `goals_weightage` exactly
  - Example: If `goals_weightage = 60%`, total must be exactly 60%
  - 59% or 61% will be rejected
- Updates score card status to `'pending_acceptance'`
- Updates `updated_by` with current user ID
- Only HR Admin can send for acceptance
- TODO: Create notification for employee (not yet implemented)

**Status Flow:**
- `'planning'` → `'pending_acceptance'` (this endpoint)
- `'pending_acceptance'` → `'active'` (employee acceptance - not yet implemented)
- `'active'` → `'completed'` (evaluation complete - not yet implemented)

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```
**Cause:** Token missing, expired, or invalid  
**Solution:** Re-login to get new token

### 403 Forbidden
```json
{
  "error": "Access denied. Required role: HR Admin"
}
```
**Cause:** User doesn't have required role  
**Solution:** Use account with correct role

### 404 Not Found
```json
{
  "error": "Score card not found"
}
```
**Cause:** Resource doesn't exist or has been deleted  
**Solution:** Verify the ID is correct

### 400 Bad Request
Various validation errors:
- Missing required fields
- Invalid data format
- Business rule violations (e.g., weight exceeds limit)

---

## Data Models Reference

### Goal Model Fields
```python
{
  "id": Integer (PK),
  "score_card_id": Integer (FK to score_cards.id),
  "goal_name": String(255),
  "description": Text (nullable),
  "success_criteria": Text (nullable),
  "weight": Integer (0-100),
  "added_by_role": String(20) - 'HR', 'Manager', or 'Employee',
  "added_by_user_id": Integer (FK to users.id),
  "start_date": Date (nullable),
  "end_date": Date (nullable),
  "deadline_date": Date (nullable),
  "status": String(50) - default 'active',
  "created_by": Integer (FK to users.id),
  "updated_by": Integer (FK to users.id, nullable),
  "created_at": DateTime,
  "updated_at": DateTime,
  "deleted_at": DateTime (nullable)
}
```

### Score Card Model Fields
```python
{
  "id": Integer (PK),
  "employee_id": Integer (FK to employees.id),
  "review_period_id": Integer (FK to review_periods.id),
  "status": String(50) - 'planning', 'pending_acceptance', 'active', 'completed',
  "goals_weightage": Integer (default: 60),
  "competencies_weightage": Integer (default: 25),
  "values_weightage": Integer (default: 15),
  "overall_rating": Float (nullable),
  "created_by": Integer (FK to users.id, nullable),
  "updated_by": Integer (FK to users.id, nullable),
  "created_at": DateTime,
  "updated_at": DateTime,
  "deleted_at": DateTime (nullable)
}
```

**Unique Constraint:** `(employee_id, review_period_id)` - One score card per employee per period

---

## Role Mapping

JWT token contains `role` field which is mapped to `added_by_role`:

| JWT Role | Mapped To | Description |
|----------|-----------|-------------|
| `'HR Admin'` | `'HR'` | HR Admin users |
| `'Manager'` | `'Manager'` | Manager users |
| `'Employee'` | `'Employee'` | Employee users |
| Other/Unknown | `'Employee'` | Default fallback |

---

## Validation Rules Summary

1. **Weightage Distribution:**
   - `goals_weightage + competencies_weightage + values_weightage = 100%` (exact)

2. **Goal Weight:**
   - Individual goal weight: 0-100%
   - Total goal weights: ≤ `goals_weightage` (when adding/updating)
   - Total goal weights: = `goals_weightage` (exact, when sending for acceptance)

3. **Date Formats:**
   - All dates: `YYYY-MM-DD` format (e.g., "2025-01-01")
   - Invalid format returns 400 error

4. **Required Fields:**
   - Add Goal: `goal_name`, `weight`
   - Update Weightage: All three weightages required
   - Generate Score Cards: `review_period_id`, `profile_ids`

---

## Test Credentials

**HR Admin:**
- Email: `hr@pms.com`
- Password: `hr123`
- Role: HR Admin
- Employee ID: 1 (excluded from score card generation)

**Current Test Data:**
- Active Review Period ID: 2
- Score Card ID: 4 (Team Manager, Review Period: 2)
- Score Card ID: 5 (Regular Employee, Review Period: 2)
- Test Goal ID: 1 (Score Card: 4, Weight: 40%)

---

## Example Workflow

### Complete Flow: HR Generates Score Cards → Adds Goals → Sends for Acceptance

**Step 1: Get Eligibility Profiles**
```bash
GET /api/eligibility-profiles
# Returns 5 profiles with employee counts
```

**Step 2: Generate Score Cards**
```bash
POST /api/planning/generate-score-cards
{
  "review_period_id": 2,
  "profile_ids": [1, 2]
}
# Creates empty score cards for matching employees
```

**Step 3: Get Score Cards List**
```bash
GET /api/score-cards?review_period_id=2
# Returns list of created score cards
```

**Step 4: Get Goals (Initially Empty)**
```bash
GET /api/score-cards/4/goals
# Returns empty goals array, planning_progress shows all zeros
```

**Step 5: Add Goals**
```bash
POST /api/score-cards/4/goals
{
  "goal_name": "Increase Sales",
  "weight": 30,
  "description": "Achieve 20% growth"
}
# Add more goals until total = 60%
```

**Step 6: Update Weightage (Optional)**
```bash
PUT /api/score-cards/4/weightage
{
  "goals_weightage": 70,
  "competencies_weightage": 20,
  "values_weightage": 10
}
# Adjusts distribution
```

**Step 7: Send for Acceptance**
```bash
POST /api/score-cards/4/send-for-acceptance
# Validates total goal weights = goals_weightage exactly
# Updates status to 'pending_acceptance'
```

---

## Notes

- All timestamps are in UTC
- Soft deletes are used (no physical deletion)
- Default weightage: Goals 60%, Competencies 25%, Values 15%
- HR Admin is automatically excluded from score card generation
- Role is extracted from JWT token automatically
- File uploads are stubbed (no backend storage yet)
