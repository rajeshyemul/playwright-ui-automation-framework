# ParaBank Application - Smoke Test Cases

## Overview
Smoke tests verify the core functionality of the ParaBank application is working correctly. These tests should be run after any deployment or major changes to ensure the application is stable.

## Test Cases

### TC-SMK-001: Application Accessibility
**Priority:** Critical
**Test Type:** Smoke
**Preconditions:**
- Internet connection available
- Browser supports JavaScript

**Test Steps:**
1. Open browser
2. Navigate to https://parabank.parasoft.com/parabank
3. Verify page loads successfully

**Expected Results:**
- Page loads within 5 seconds
- ParaBank logo is visible
- No JavaScript errors in console
- Page title contains "ParaBank"

**Pass/Fail Criteria:**
- PASS: All expected results met
- FAIL: Any expected result not met

---

### TC-SMK-002: User Registration
**Priority:** Critical
**Test Type:** Smoke
**Preconditions:**
- Application is accessible

**Test Steps:**
1. Navigate to ParaBank home page
2. Click "Register" link
3. Fill all required fields with valid data:
   - First Name: John
   - Last Name: Doe
   - Address: 123 Main St
   - City: Anytown
   - State: CA
   - Zip Code: 12345
   - Phone: 555-1234
   - SSN: 123-45-6789
   - Username: testuser001
   - Password: password123
   - Confirm Password: password123
4. Click "Register" button

**Expected Results:**
- Registration successful message displayed
- User is automatically logged in
- Redirected to account overview page
- Welcome message shows user's name

**Pass/Fail Criteria:**
- PASS: Registration completes successfully
- FAIL: Registration fails or error occurs

---

### TC-SMK-003: User Login
**Priority:** Critical
**Test Type:** Smoke
**Preconditions:**
- Valid user account exists (from TC-SMK-002)

**Test Steps:**
1. Navigate to ParaBank home page
2. Enter valid username and password
3. Click "Log In" button

**Expected Results:**
- Login successful
- Redirected to account overview page
- Welcome message displays
- Account information is visible

**Pass/Fail Criteria:**
- PASS: Login completes successfully
- FAIL: Login fails or error occurs

---

### TC-SMK-004: Account Overview
**Priority:** Critical
**Test Type:** Smoke
**Preconditions:**
- User is logged in

**Test Steps:**
1. Login to application
2. Verify account overview page loads
3. Check account balance is displayed
4. Verify account details are shown

**Expected Results:**
- Account overview page displays correctly
- At least one account is visible
- Account balance is shown
- Account number is displayed

**Pass/Fail Criteria:**
- PASS: All account information displays correctly
- FAIL: Account information missing or incorrect

---

### TC-SMK-005: Logout Functionality
**Priority:** Critical
**Test Type:** Smoke
**Preconditions:**
- User is logged in

**Test Steps:**
1. Login to application
2. Click "Log Out" link
3. Verify logout successful

**Expected Results:**
- User is logged out
- Redirected to home page
- Login form is visible
- No user-specific information displayed

**Pass/Fail Criteria:**
- PASS: Logout completes successfully
- FAIL: Logout fails or user remains logged in