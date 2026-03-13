import { expect } from '@playwright/test';
import { Logger } from '../logger/Logger';
import { StepRunner } from '../reporting/StepRunner';

export class AssertUtils {
  public async assertTrue(
    condition: boolean,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(condition, `${description} | Expected: true, Actual: ${condition}`).toBeTruthy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertContains(
    value1: string,
    value2: string,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value1, `${description} | "${value1}" should contain "${value2}"`).toContain(value2);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertArrayContains<T>(
    expectedValues: T[],
    actual: T,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(expectedValues, `${description} | "${actual}" should be present`).toContain(actual);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertEquals(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(actual, `${description} | Expected: "${expected}", Actual: "${actual}"`).toEqual(
          expected
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertNotEquals(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          actual,
          `${description} | Expected NOT equal to "${expected}", Actual: "${actual}"`
        ).not.toEqual(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertNotNull(value: any, description: string, softAssert = false): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected: NOT null, Actual: ${value}`).not.toEqual(null);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertNotNaN(value: any, description: string, softAssert = false): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected: NOT NaN, Actual: ${value}`).not.toEqual(NaN);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertNull(value: any, description: string, softAssert = false): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected: null, Actual: ${value}`).toEqual(null);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertUndefined(value: any, description: string, softAssert = false): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected: undefined, Actual: ${value}`).toBeUndefined();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertToBeEmpty(value: any, description: string, softAssert = false): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(value, `${description} | Expected to be empty`).toBeEmpty();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertGreaterThan(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(actual, `${description} | Expected ${actual} > ${expected}`).toBeGreaterThan(
          expected
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertLessThan(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(actual, `${description} | Expected ${actual} < ${expected}`).toBeLessThan(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertHasClass(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    const regexClassName = new RegExp(expected);
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(actual, `${description} | Expected class "${expected}"`).toHaveClass(
          regexClassName
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertArrayNotContains<T>(
    expectedValues: T[],
    actual: T,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(expectedValues, `${description} | "${actual}" should NOT be present`).not.toContain(
          actual
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }
}
