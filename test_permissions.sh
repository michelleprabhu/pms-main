#!/bin/bash
# Test script for RBAC Permissions System
# Usage: ./test_permissions.sh <email> <password>

EMAIL=${1:-"hr@example.com"}
PASSWORD=${2:-"password123"}

echo "🔐 Testing RBAC Permissions System"
echo "=================================="
echo ""

# Step 1: Login and get token
echo "1️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5002/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_DATA=$(echo $LOGIN_RESPONSE | grep -o '"user":{[^}]*"permissions":\[[^]]*\]' || echo "")

# Check if login actually failed (error in response)
if echo "$LOGIN_RESPONSE" | grep -q '"error"'; then
  echo "❌ Login failed. Please check credentials."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

if [ -z "$TOKEN" ]; then
  echo "⚠️  Warning: No token found in response"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Check if permissions are in response
if echo "$LOGIN_RESPONSE" | grep -q "permissions"; then
  echo "✅ Permissions found in login response"
  echo "$LOGIN_RESPONSE" | grep -o '"permissions":\[[^]]*\]' | head -1
else
  echo "⚠️  No permissions in login response (might be empty array)"
fi
echo ""

# Step 2: Get current user (should include permissions)
echo "2️⃣  Testing /api/current-user endpoint..."
CURRENT_USER=$(curl -s http://localhost:5002/api/current-user \
  -H "Authorization: Bearer $TOKEN")

if echo "$CURRENT_USER" | grep -q "permissions"; then
  echo "✅ Current user endpoint returns permissions"
  echo "$CURRENT_USER" | grep -o '"permissions":\[[^]]*\]' | head -1
else
  echo "⚠️  No permissions in current-user response"
  echo "Response: $CURRENT_USER"
fi
echo ""

# Step 3: Test permission-protected endpoint
echo "3️⃣  Testing permission-protected endpoint (requires manage_permissions)..."
PERMISSIONS_LIST=$(curl -s http://localhost:5002/api/permissions \
  -H "Authorization: Bearer $TOKEN")

if echo "$PERMISSIONS_LIST" | grep -q "permissions"; then
  echo "✅ Successfully accessed /api/permissions"
  PERM_COUNT=$(echo "$PERMISSIONS_LIST" | grep -o '"code":"[^"]*' | wc -l)
  echo "   Found $PERM_COUNT permissions"
else
  echo "❌ Failed to access /api/permissions"
  echo "Response: $PERMISSIONS_LIST"
fi
echo ""

# Step 4: Test role permissions endpoint
echo "4️⃣  Testing /api/roles/<id>/permissions endpoint..."
ROLE_ID=$(echo "$CURRENT_USER" | grep -o '"role_id":[0-9]*' | grep -o '[0-9]*')
if [ ! -z "$ROLE_ID" ]; then
  ROLE_PERMS=$(curl -s "http://localhost:5002/api/roles/$ROLE_ID/permissions" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$ROLE_PERMS" | grep -q "permissions"; then
    echo "✅ Successfully retrieved role permissions"
    PERM_COUNT=$(echo "$ROLE_PERMS" | grep -o '"code":"[^"]*' | wc -l)
    echo "   Role ID $ROLE_ID has $PERM_COUNT permissions"
  else
    echo "⚠️  Response: $ROLE_PERMS"
  fi
else
  echo "⚠️  Could not extract role_id from user data"
fi
echo ""

# Step 5: Test user permissions endpoint
echo "5️⃣  Testing /api/users/<id>/permissions endpoint..."
USER_ID=$(echo "$CURRENT_USER" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
if [ ! -z "$USER_ID" ]; then
  USER_PERMS=$(curl -s "http://localhost:5002/api/users/$USER_ID/permissions" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$USER_PERMS" | grep -q "permission_codes"; then
    echo "✅ Successfully retrieved user permissions"
    echo "$USER_PERMS" | grep -o '"permission_codes":\[[^]]*\]' | head -1
  else
    echo "⚠️  Response: $USER_PERMS"
  fi
else
  echo "⚠️  Could not extract user_id"
fi
echo ""

echo "=================================="
echo "✅ Permission system test complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:4300 in your browser"
echo "   2. Login with your credentials"
echo "   3. Check browser console for permissions in login response"
echo "   4. Try navigating to protected routes"
echo "   5. Check that sidebar links show/hide based on permissions"

