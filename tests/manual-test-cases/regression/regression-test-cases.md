# ParaBank Application - Regression Test Cases

## Overview
Regression tests verify that existing functionality still works after code changes. These tests cover all major features and should be run before releases.

## Test Cases

### TC-REG-001: Registration Form Validation
**Priority:** High
**Test Type:** Regression
**Preconditions:**
- Application is accessible

**Test Steps:**
1. Navigate to registration page
2. Click "Register" without filling any fields
3. Verify error messages for all required fields
4. Fill form with invalid data:
   - Username: existing username
   - Password: short password
   - Email: invalid format
5. Verify appropriate error messages

**Expected Results:**
- Error messages displayed for all required fields
- Specific validation messages for invalid data
- Form prevents submission with invalid data

**Pass/Fail Criteria:**
- PASS: All validation works correctly
- FAIL: Validation fails or incorrect messages

---

### TC-REG-002: Login Error Handling
**Priority:** High
**Test Type:** Regression
**Preconditions:**
- Application is accessible

**Test Steps:**
1. Navigate to login page
2. Attempt login with:
   - Invalid username
   - Invalid password
   - Empty fields
   - SQL injection attempts
3. Verify error messages for each scenario

**Expected Results:**
- Appropriate error messages for each invalid login attempt
- Application remains secure
- No sensitive information exposed

**Pass/Fail Criteria:**
- PASS: All error scenarios handled correctly
- FAIL: Security vulnerability or incorrect error handling

---

### TC-REG-003: Transfer Funds Functionality
**Priority:** High
**Test Type:** Regression
**Preconditions:**
- User has multiple accounts with sufficient balance

**Test Steps:**
1. Login to application
2. Navigate to Transfer Funds page
3. Select source and destination accounts
4. Enter valid transfer amount
5. Click "Transfer" button
6. Verify transfer completion
7. Check account balances updated correctly

**Expected Results:**
- Transfer completes successfully
- Source account balance decreases
- Destination account balance increases
- Transaction recorded in account history

**Pass/Fail Criteria:**
- PASS: Transfer completes and balances update correctly
- FAIL: Transfer fails or balances incorrect

---

### TC-REG-004: Bill Pay Functionality
**Priority:** High
**Test Type:** Regression
**Preconditions:**
- User has account with sufficient balance

**Test Steps:**
1. Login to application
2. Navigate to Bill Pay page
3. Fill bill payment form:
   - Payee Name: Test Payee
   - Address: 123 Test St
   - City: Test City
   - State: CA
   - Zip Code: 12345
   - Phone: 555-1234
   - Account Number: 12345
   - Verify Account: 12345
   - Amount: 100.00
4. Click "Send Payment" button
5. Verify payment completion

**Expected Results:**
- Bill payment processes successfully
- Account balance decreases by payment amount
- Payment confirmation displayed
- Transaction appears in account history

**Pass/Fail Criteria:**
- PASS: Bill payment completes successfully
- FAIL: Payment fails or balance not updated

---

### TC-REG-005: Account Details and History
**Priority:** Medium
**Test Type:** Regression
**Preconditions:**
- User has account with transaction history

**Test Steps:**
1. Login to application
2. Click on account number link
3. Verify account details page loads
4. Check transaction history displays
5. Verify transaction details are correct
6. Test pagination if multiple transactions exist

**Expected Results:**
- Account details display correctly
- Transaction history shows all transactions
- Transaction amounts and dates are accurate
- Balance calculations are correct

**Pass/Fail Criteria:**
- PASS: All account information displays correctly
- FAIL: Information missing or incorrect

---

### TC-REG-006: Update Contact Information
**Priority:** Medium
**Test Type:** Regression
**Preconditions:**
- User is logged in

**Test Steps:**
1. Login to application
2. Navigate to Update Contact Info page
3. Update contact information fields
4. Click "Update Profile" button
5. Verify changes saved successfully
6. Logout and login again to verify persistence

**Expected Results:**
- Contact information updates successfully
- Changes persist after logout/login
- Updated information displays correctly

**Pass/Fail Criteria:**
- PASS: Contact information updates and persists
- FAIL: Update fails or changes don't persist

---

### TC-REG-007: Find Transactions
**Priority:** Medium
**Test Type:** Regression
**Preconditions:**
- User has account with multiple transactions

**Test Steps:**
1. Login to application
2. Navigate to Find Transactions page
3. Search by:
   - Transaction ID
   - Date range
   - Amount
4. Verify search results are accurate
5. Test edge cases (no results, invalid searches)

**Expected Results:**
- Search functionality works correctly
- Results match search criteria
- Appropriate messages for no results
- Transaction details display correctly

**Pass/Fail Criteria:**
- PASS: All search scenarios work correctly
- FAIL: Search fails or returns incorrect results

---

### TC-REG-008: Request Loan
**Priority:** Medium
**Test Type:** Regression
**Preconditions:**
- User has account with sufficient balance for down payment

**Test Steps:**
1. Login to application
2. Navigate to Request Loan page
3. Fill loan request form:
   - Loan Amount: 10000
   - Down Payment: 1000
   - From Account: Select account
4. Click "Apply Now" button
5. Verify loan approval/denial

**Expected Results:**
- Loan application processes
- Appropriate approval/denial message
- Account balance updates if approved
- Loan details recorded

**Pass/Fail Criteria:**
- PASS: Loan request processes correctly
- FAIL: Application fails or incorrect processing