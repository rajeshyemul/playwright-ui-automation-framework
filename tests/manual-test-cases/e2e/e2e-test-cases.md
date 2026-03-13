# ParaBank Application - End-to-End Test Cases

## Overview
End-to-End tests verify complete user workflows from start to finish. These tests simulate real user scenarios and ensure all system components work together correctly.

## Test Cases

### TC-E2E-001: Complete User Registration and First Login
**Priority:** Critical
**Test Type:** E2E
**Preconditions:**
- Application is accessible
- Clean database state

**Test Steps:**
1. Navigate to ParaBank home page
2. Click "Register" link
3. Complete registration with valid information
4. Verify registration success
5. Logout from application
6. Login with new credentials
7. Verify successful login and account creation

**Expected Results:**
- Registration completes successfully
- User can logout and login again
- Account is properly created
- Welcome message displays correct information

**Pass/Fail Criteria:**
- PASS: Complete registration and login flow works
- FAIL: Any step in the flow fails

---

### TC-E2E-002: Account Management Workflow
**Priority:** High
**Test Type:** E2E
**Preconditions:**
- User account exists with initial balance

**Test Steps:**
1. Login to application
2. View account overview
3. Click on account number to view details
4. Review transaction history
5. Update contact information
6. Verify changes persist after logout/login

**Expected Results:**
- All account information displays correctly
- Contact information updates successfully
- Changes persist across sessions
- Navigation between account features works

**Pass/Fail Criteria:**
- PASS: Complete account management flow works
- FAIL: Any account management feature fails

---

### TC-E2E-003: Funds Transfer Workflow
**Priority:** High
**Test Type:** E2E
**Preconditions:**
- User has multiple accounts
- Sufficient balance in source account

**Test Steps:**
1. Login to application
2. Navigate to Transfer Funds page
3. Select source and destination accounts
4. Enter transfer amount
5. Complete transfer
6. Verify balances updated in both accounts
7. Check transaction appears in account history
8. Verify transfer details are correct

**Expected Results:**
- Transfer completes successfully
- Both account balances update correctly
- Transaction recorded in history
- Transfer amount and details are accurate

**Pass/Fail Criteria:**
- PASS: Complete transfer workflow succeeds
- FAIL: Transfer fails or data inconsistency occurs

---

### TC-E2E-004: Bill Payment Workflow
**Priority:** High
**Test Type:** E2E
**Preconditions:**
- User has account with sufficient balance

**Test Steps:**
1. Login to application
2. Navigate to Bill Pay page
3. Enter payee information
4. Enter payment amount
5. Submit payment
6. Verify payment confirmation
7. Check account balance decreased
8. Verify payment appears in transaction history
9. Verify payment details are correct

**Expected Results:**
- Bill payment processes successfully
- Account balance updates correctly
- Payment confirmation provided
- Transaction recorded in history

**Pass/Fail Criteria:**
- PASS: Complete bill payment workflow succeeds
- FAIL: Payment fails or data inconsistency occurs

---

### TC-E2E-005: Loan Application Workflow
**Priority:** Medium
**Test Type:** E2E
**Preconditions:**
- User has account with sufficient balance for down payment

**Test Steps:**
1. Login to application
2. Navigate to Request Loan page
3. Fill loan application form
4. Submit loan request
5. Verify loan approval/denial
6. If approved, verify loan amount credited to account
7. Check loan details in account history

**Expected Results:**
- Loan application processes
- Appropriate approval/denial decision
- Account balance updates if approved
- Loan transaction recorded

**Pass/Fail Criteria:**
- PASS: Complete loan workflow processes correctly
- FAIL: Loan application fails or incorrect processing

---

### TC-E2E-006: Transaction Search and Verification
**Priority:** Medium
**Test Type:** E2E
**Preconditions:**
- User has multiple transactions in account history

**Test Steps:**
1. Login to application
2. Navigate to Find Transactions page
3. Search transactions by different criteria:
   - Transaction ID
   - Date range
   - Amount range
4. Verify search results accuracy
5. Click on transaction details
6. Verify transaction information is correct
7. Test edge cases (no results, invalid searches)

**Expected Results:**
- Search functionality works for all criteria
- Results are accurate and complete
- Transaction details display correctly
- Appropriate handling of edge cases

**Pass/Fail Criteria:**
- PASS: All search and verification scenarios work
- FAIL: Search fails or returns incorrect results

---

### TC-E2E-007: Complete Banking Session
**Priority:** High
**Test Type:** E2E
**Preconditions:**
- User account exists

**Test Steps:**
1. Login to application
2. Check account balances
3. Transfer funds between accounts
4. Pay a bill
5. Check updated balances
6. Review transaction history
7. Update profile information
8. Logout from application

**Expected Results:**
- All banking operations complete successfully
- Account balances update correctly after each transaction
- Transaction history reflects all activities
- Profile updates persist
- Clean logout

**Pass/Fail Criteria:**
- PASS: Complete banking session works flawlessly
- FAIL: Any operation fails or data inconsistency occurs

---

### TC-E2E-008: Error Recovery and Validation
**Priority:** Medium
**Test Type:** E2E
**Preconditions:**
- Application is accessible

**Test Steps:**
1. Attempt login with invalid credentials
2. Verify error message and recovery
3. Attempt registration with duplicate username
4. Verify error handling
5. Attempt transfer with insufficient funds
6. Verify error message and account balance unchanged
7. Test network interruption scenarios (if possible)
8. Verify application recovers gracefully

**Expected Results:**
- All error scenarios handled gracefully
- Appropriate error messages displayed
- Application state remains consistent
- User can recover from errors

**Pass/Fail Criteria:**
- PASS: All error scenarios handled correctly
- FAIL: Application crashes or data corruption occurs