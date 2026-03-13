/**
 * Test Data Provider
 *
 * Centralizes test data management and provides reusable test data
 * with dynamic generation capabilities
 */

export interface UserData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  ssn: string;
  username: string;
  password: string;
  confirmPassword?: string;
}

export interface TransferData {
  amount: string;
  fromAccount?: string;
  toAccount?: string;
}

export interface BillPayData {
  payeeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  accountNumber: string;
  verifyAccount: string;
  amount: string;
}

export class TestDataProvider {

  /**
   * Generate unique user data for registration
   */
  static generateUserData(overrides: Partial<UserData> = {}): UserData {
    const timestamp = Date.now();
    const baseData: UserData = {
      firstName: 'Test',
      lastName: 'User',
      address: '123 Test Street',
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
      phone: '555-1234',
      ssn: '123-45-6789',
      username: `testuser${timestamp}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Generate user data for smoke tests
   */
  static getSmokeTestUser(): UserData {
    return this.generateUserData({
      firstName: 'Smoke',
      lastName: 'Test',
      address: '123 Smoke St',
      city: 'Smoke City'
    });
  }

  /**
   * Generate user data for regression tests
   */
  static getRegressionTestUser(): UserData {
    return this.generateUserData({
      firstName: 'Regression',
      lastName: 'Test',
      address: '456 Regression Ave',
      city: 'Regression City'
    });
  }

  /**
   * Generate user data for E2E tests
   */
  static getE2eTestUser(): UserData {
    return this.generateUserData({
      firstName: 'E2E',
      lastName: 'Test',
      address: '789 E2E Blvd',
      city: 'E2E City'
    });
  }

  /**
   * Generate transfer data
   */
  static generateTransferData(overrides: Partial<TransferData> = {}): TransferData {
    const baseData: TransferData = {
      amount: '100.00',
      fromAccount: '',
      toAccount: ''
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Generate bill pay data
   */
  static generateBillPayData(overrides: Partial<BillPayData> = {}): BillPayData {
    const baseData: BillPayData = {
      payeeName: 'Test Payee',
      address: '123 Payee St',
      city: 'Payee City',
      state: 'CA',
      zipCode: '12345',
      phone: '555-9999',
      accountNumber: '123456789',
      verifyAccount: '123456789',
      amount: '50.00'
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Get predefined test users for specific scenarios
   */
  static getPredefinedUsers() {
    return {
      validUser: this.generateUserData({
        firstName: 'Valid',
        lastName: 'User',
        username: 'validuser',
        password: 'validpass123'
      }),

      invalidUser: {
        username: 'invaliduser',
        password: 'wrongpass'
      },

      emptyUser: {
        username: '',
        password: ''
      }
    };
  }

  /**
   * Generate invalid user data for validation testing
   */
  static generateInvalidUserData(): UserData {
    return {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      ssn: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
  }

  /**
   * Generate user data with mismatched passwords
   */
  static generateUserWithMismatchedPasswords(): UserData {
    const user = this.generateUserData();
    return {
      ...user,
      confirmPassword: 'differentpassword'
    };
  }
}