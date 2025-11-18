#!/bin/bash

echo "=========================================="
echo "JWT AUTHENTICATION TEST SCRIPT"
echo "=========================================="
echo ""

BASE_URL="http://localhost:5071"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Register new user${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123456"
  }')

echo "Response: $REGISTER_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get token from registration${NC}"
    echo ""
    echo -e "${YELLOW}Trying login instead...${NC}"

    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "usernameOrEmail": "test@example.com",
        "password": "Test@123456"
      }')

    echo "Login Response: $LOGIN_RESPONSE"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No token received! Check if API is running.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token received:${NC}"
echo "$TOKEN"
echo ""

echo "=========================================="
echo -e "${YELLOW}Step 2: Decode token (using jwt.io format)${NC}"
echo "Paste this token at https://jwt.io/ to see claims"
echo ""

# Decode JWT header and payload (simple base64 decode)
HEADER=$(echo $TOKEN | cut -d'.' -f1)
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2)

echo -e "${GREEN}Payload (decoded):${NC}"
echo $PAYLOAD | base64 -d 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Could not decode payload"
echo ""

echo "=========================================="
echo -e "${YELLOW}Step 3: Test protected endpoint${NC}"
echo ""

echo "Testing GET /api/user/users (requires Admin role)"
PROTECTED_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/user/users" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$PROTECTED_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$PROTECTED_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! Authentication working!${NC}"
elif [ "$HTTP_STATUS" = "401" ]; then
    echo -e "${RED}❌ 401 Unauthorized - Token not accepted${NC}"
    echo ""
    echo "Possible issues:"
    echo "1. JWT middleware not configured correctly"
    echo "2. Token Issuer/Audience mismatch"
    echo "3. Invalid signature"
    echo "4. Token expired"
elif [ "$HTTP_STATUS" = "403" ]; then
    echo -e "${YELLOW}⚠️  403 Forbidden - Token valid but user lacks Admin role${NC}"
    echo -e "${GREEN}This means JWT authentication is WORKING!${NC}"
    echo "User just doesn't have Admin role assigned."
else
    echo -e "${RED}❌ Unexpected status: $HTTP_STATUS${NC}"
fi

echo ""
echo "=========================================="
echo -e "${YELLOW}Step 4: Test endpoint that doesn't require specific role${NC}"
echo ""

echo "Testing GET /api/user/userInfo/{token}"
USER_INFO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/user/userInfo/$TOKEN" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$USER_INFO_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$USER_INFO_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ JWT Authentication is WORKING!${NC}"
else
    echo -e "${RED}❌ Authentication failed with status: $HTTP_STATUS${NC}"
fi

echo ""
echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo "Token: $TOKEN"
echo ""
echo "To test manually with curl:"
echo "curl -H \"Authorization: Bearer $TOKEN\" http://localhost:5071/api/user/userInfo/$TOKEN"
echo ""
