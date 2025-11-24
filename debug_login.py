import requests
import json

BASE_URL = 'http://localhost:5003/api'

users = [
    {'email': 'hr@pms.com', 'password': 'hr123', 'role': 'HR Admin'},
    {'email': 'manager@pms.com', 'password': 'manager123', 'role': 'Manager'},
    {'email': 'employee@pms.com', 'password': 'employee123', 'role': 'Employee'}
]

print(f"Testing login against {BASE_URL}...\n")

for user in users:
    print(f"--- Attempting login for {user['role']} ({user['email']}) ---")
    try:
        response = requests.post(f"{BASE_URL}/login", json={
            'email': user['email'],
            'password': user['password']
        })
        
        if response.status_code == 200:
            data = response.json()
            user_data = data.get('user', {})
            print(f"✅ Login SUCCESS")
            print(f"   Role Name: '{user_data.get('role')}'")
            print(f"   Role ID: {user_data.get('role_id')}")
            
            permissions = user_data.get('permissions', [])
            print(f"   Permissions Count: {len(permissions)}")
            
            # Check for specific permissions related to dashboard/analytics
            critical_perms = [
                'view_hr_reports_page', 
                'view_manager_dashboard', 
                'view_employee_dashboard',
                'view_scorecards_page'
            ]
            
            print("   Critical Permissions Check:")
            for perm in critical_perms:
                has_perm = perm in permissions
                mark = "✅" if has_perm else "❌"
                print(f"     {mark} {perm}")
                
        else:
            print(f"❌ Login FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("\n")
