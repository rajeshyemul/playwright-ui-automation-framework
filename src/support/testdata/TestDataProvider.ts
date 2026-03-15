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
   * Generate a pseudo-random identity value for the application's SSN field.
   */
  private static generateUniqueSsn(): string {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);

    return `${part1}-${part2}-${part3}`;
  }

  /**
   * Generate unique user data for registration
   */
  static generateUserData(overrides: Partial<UserData> = {}): UserData {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const baseData: UserData = {
      firstName: 'Aarav',
      lastName: 'Sharma',
      address: '24 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560001',
      phone: '9876543210',
      ssn: this.generateUniqueSsn(),
      username: `indianuser${timestamp}${randomSuffix}`,
      password: 'password123',
      confirmPassword: 'password123',
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Generate user data for smoke tests
   */
  static getSmokeTestUser(): UserData {
    return this.generateUserData({
      firstName: 'Priya',
      lastName: 'Nair',
      address: '15 Residency Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560025',
      phone: '9810012345',
    });
  }

  /**
   * Generate user data for regression tests
   */
  static getRegressionTestUser(): UserData {
    return this.generateUserData({
      firstName: 'Rohan',
      lastName: 'Mehta',
      address: '42 Law Garden',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380006',
      phone: '9825012345',
    });
  }

  /**
   * Generate user data for E2E tests
   */
  static getE2eTestUser(): UserData {
    return this.generateUserData({
      firstName: 'Ananya',
      lastName: 'Iyer',
      address: '8 T Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600017',
      phone: '9840012345',
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
      payeeName: 'BESCOM',
      address: 'Krishna Rajendra Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560001',
      phone: '8045678901',
      accountNumber: '123456789',
      verifyAccount: '123456789',
      amount: '50.00',
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Get predefined test users for specific scenarios
   */
  static getPredefinedUsers() {
    return {
      validUser: this.generateUserData({
        firstName: 'Neha',
        lastName: 'Verma',
        username: 'validindianuser',
        password: 'validpass123',
      }),

      invalidUser: {
        username: 'invalidindianuser',
        password: 'wrongpass',
      },

      emptyUser: {
        username: '',
        password: '',
      },
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
      confirmPassword: 'differentpassword',
    };
  }
}
