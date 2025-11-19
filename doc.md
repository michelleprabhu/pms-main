Phase 1 
- Auth and user management, 
- Authorization, 
- Dashboard
- Review Period Management 
- Eligibility Profile Management
- Goal Management (Goal Plan Process)



### Functionality / Modules 

- Authentication 
- User Management (CRUD)
- RBAC , roles - sys admin, hr, manager, employee
- Dashboard *
- Review Periods 
    * CRUD
    * Ability to open and close a review period
- Goal Management 
- Goal Planning 
- Set start date and end date
- Define Period Type ( Q1, annual..)
- Allocation of Employees under the review period
 idea - goal plans can be linked to this review period 



## Database Design 
users and auth
* user_id 
* employee_id
users and auth table contains user_id and employee_id and basic details of an employee.

Employee Mater data table has the review period they get allocated to , the dept_id , dept_name, goal_plan_id, dev_goal_id,  job_title, job_id.

Review Period
start_date, end_date, financial_period, desc


goal plan table 
goal_plan_id , plan_name, review_period, list_of_employees, start_date, end_date, goal_desc, min_goals, max_goals, tot_goals, weight, -- refer to table 


## User auth
fe login screen
backend endpoints 
- auth/login
( jwt, eddsa??)
role based access for backend endpoints

## UI 
- HR dashboard framework ( goal planniing ui - form , assigning )
- Manager dashboard framewoek (goal editting  )
- Employee dahsboard (set of goals from rev)

## 










