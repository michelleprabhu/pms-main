<!-- 63387c45-574c-40c6-bc40-74d4a25db0de 68c873db-8fe8-4d1c-b384-531cf5fcc72f -->
# Remove All Hardcoded Data - Make Frontend DB-Backed

## Problem

Multiple frontend components have hardcoded data:

- Employee names (John Doe, Sarah Johnson, Michael Chen)
- Goals, competencies, values arrays
- Score card details
- Employee information

## Solution

Create missing API endpoints and update all components to fetch from database.

---

## Phase 1: Create Missing Backend API Endpoints

### 1.1 Add GET endpoint for single score card by ID

**File:** `app.py`

- **Endpoint:** `GET /api/score-cards/<int:score_card_id>`
- **Returns:** Score card with full employee details, review period, weightage
- **Response format:**
  ```json
  {
    "id": 7,
    "employee_id": 3,
    "review_period_id": 2,
    "status": "planning",
    "goals_weightage": 60,
    "competencies_weightage": 25,
    "values_weightage": 15,
    "employee": {
      "id": 3,
      "full_name": "Actual Name",
      "email": "actual@email.com",
      "position": {"id": 3, "title": "Position"},
      "department": {"id": 3, "name": "Department"},
      "reporting_manager": {"id": 2, "full_name": "Manager Name"}
    },
    "review_period": {
      "id": 2,
      "period_name": "Q1 2025",
      "start_date": "2025-01-01",
      "end_date": "2025-03-31"
    }
  }
  ```


### 1.2 Update existing endpoints to include full employee data

**File:** `app.py`

- Ensure `/api/score-cards/<id>/goals` includes employee info in response
- Add employee details to weightage endpoint if missing

---

## Phase 2: Update score-card-details Component (HR)

### 2.1 Remove hardcoded data

**File:** `frontend/src/app/score-card-details/score-card-details.ts`

- Remove hardcoded `employeeName: 'John Doe'`
- Remove hardcoded `competencies` array (12 items)
- Remove hardcoded `values` array (6 items)
- Remove hardcoded `planningComments` array

### 2.2 Add data fetching methods

- **Method:** `loadScoreCardDetails(scoreCardId: number)`
  - Calls `GET /api/score-cards/<score_card_id>`
  - Populates `scoreCard` with real employee name, review period, status
- **Method:** `loadCompetencies(scoreCardId: number)`
  - Calls `GET /api/score-cards/<score_card_id>/competencies` (if exists)
  - Or fetches from competencies library
- **Method:** `loadValues(scoreCardId: number)`
  - Calls `GET /api/score-cards/<score_card_id>/values` (if exists)
  - Or fetches from values library
- **Method:** `loadComments(scoreCardId: number)`
  - Calls `GET /api/score-cards/<score_card_id>/comments` (if exists)

### 2.3 Fix Add Goal modal

- Ensure modal opens correctly (already fixed in previous change)
- Verify `addGoal()` method works with real `scoreCardId`

---

## Phase 3: Update manager-score-card-employee-detail Component

### 3.1 Remove hardcoded data

**File:** `frontend/src/app/manager-score-card-employee-detail/manager-score-card-employee-detail.ts`

- Remove hardcoded `employeeName: 'John Doe'`
- Remove hardcoded `employeePosition`, `employeeEmail`, etc.
- Remove hardcoded `activeScoreCard` and `pastScoreCards`

### 3.2 Add data fetching

- **Method:** `loadEmployeeData(employeeId: number)`
  - Calls `GET /api/employees/<employee_id>`
  - Populates employee info (name, position, department, manager, email)
- **Method:** `loadScoreCards(employeeId: number, periodId: number)`
  - Calls `GET /api/score-cards?employee_id=<id>&review_period_id=<period_id>`
  - Or use manager's team endpoint filtered by employee
  - Populates `activeScoreCard` and `pastScoreCards`

### 3.3 Update ngOnInit

- Read `employeeId` from route params
- Read `scoreCardId` from query params if available
- Call `loadEmployeeData()` and `loadScoreCards()`

---

## Phase 4: Update manager-score-card-details Component

### 4.1 Remove hardcoded data

**File:** `frontend/src/app/manager-score-card-details/manager-score-card-details.ts`

- Remove hardcoded `scoreCard.employeeName: 'Sarah Johnson'`
- Remove hardcoded `goals` array (4 items)
- Remove hardcoded `competencies` array
- Remove hardcoded `values` array
- Remove hardcoded `planningComments` array

### 4.2 Add data fetching

- **Method:** `loadScoreCardDetails(periodId: number)`
  - Get current user's employee_id from `/api/current-user`
  - Find score card for that employee and period
  - Call `GET /api/score-cards/<score_card_id>` to get full details
  - Populate `scoreCard` with real employee name
- **Method:** `loadGoals(scoreCardId: number)`
  - Already exists via `loadGoals()` - ensure it's called
- **Method:** `loadCompetencies()` and `loadValues()`
  - Similar to score-card-details

### 4.3 Update ngOnInit

- Read `periodId` from query params
- Call `loadScoreCardDetails()` first, then `loadGoals()`

---

## Phase 5: Update score-card-employee-detail Component (HR)

### 5.1 Remove hardcoded data

**File:** `frontend/src/app/score-card-employee-detail/score-card-employee-detail.ts`

- Remove hardcoded employee info
- Remove hardcoded score cards

### 5.2 Add data fetching

- Similar to manager-score-card-employee-detail
- Use employee ID from route params

---

## Phase 6: Verify All Components

### Components to check:

1. ✅ `score-card-details` - HR view
2. ✅ `manager-score-card-details` - Manager's own view
3. ✅ `manager-score-card-employee-detail` - Manager viewing employee
4. ✅ `score-card-employee-detail` - HR viewing employee
5. ✅ `employee-score-card-details` - Employee's own view
6. ✅ `employee-my-profile` - Already partially fixed
7. ✅ `manager-my-profile` - Already partially fixed

### Data to verify:

- Employee names come from database
- Goals come from API
- Competencies come from API/library
- Values come from API/library
- Score card status comes from database
- Review period info comes from database

---

## Implementation Order

1. **Backend:** Create `GET /api/score-cards/<id>` endpoint
2. **Frontend:** Update `score-card-details` (HR) - highest priority
3. **Frontend:** Update `manager-score-card-employee-detail`
4. **Frontend:** Update `manager-score-card-details`
5. **Frontend:** Update `score-card-employee-detail`
6. **Frontend:** Update remaining components if needed
7. **Test:** Verify all pages show real data

---

## Testing Checklist

- [ ] HR score card details shows real employee name (not John Doe)
- [ ] Manager employee detail shows real employee name (not John Doe)
- [ ] Manager score card details shows real employee name (not Sarah Johnson)
- [ ] Add Goal modals work on all pages
- [ ] Goals load from database
- [ ] Competencies load from database/library
- [ ] Values load from database/library
- [ ] No hardcoded data remains in console/network tab

### To-dos

- [ ] Update PerformanceDocument model with employee_id, review_period_id, status fields
- [ ] Create EligibilityProfile model
- [ ] Generate and run database migrations
- [ ] Implement eligibility_service.py with matching logic
- [ ] Implement bulk_create_performance_documents in performance_document_service.py
- [ ] Create seed_eligibility.py and run it
- [ ] Add eligibility-profiles and generate-score-cards API endpoints to app.py
- [ ] Update planning.ts with API integration and real data handling
- [ ] Update planning.html to bind to real API data