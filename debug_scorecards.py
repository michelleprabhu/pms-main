import requests
import json

BASE_URL = 'http://localhost:5003/api'

# Login as HR to get token
print("Logging in as HR...")
response = requests.post(f"{BASE_URL}/login", json={
    'email': 'hr@pms.com',
    'password': 'hr123'
})

if response.status_code != 200:
    print(f"Login failed: {response.status_code}")
    print(response.text)
    exit(1)

data = response.json()
token = data['token']
print(f"✅ Login successful, got token\n")

# Test score cards endpoint with review_period_id=1
headers = {'Authorization': f'Bearer {token}'}

print("Fetching score cards for review_period_id=1...")
response = requests.get(f"{BASE_URL}/score-cards?review_period_id=1", headers=headers)

print(f"Status Code: {response.status_code}")
print(f"Response:\n{json.dumps(response.json(), indent=2)}")

if response.status_code == 200:
    score_cards = response.json()
    print(f"\n✅ Found {len(score_cards)} score cards")
    for sc in score_cards:
        print(f"  - Score Card ID: {sc['id']}, Employee: {sc.get('employee', {}).get('full_name', 'N/A')}")
else:
    print(f"\n❌ Failed to fetch score cards")
