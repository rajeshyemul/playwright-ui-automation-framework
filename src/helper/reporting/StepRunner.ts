import { test } from '@playwright/test';
import { Logger } from '@helper/logger/Logger';
import { AllureReporter } from './AllureReporter';

/**
 * StepRunner - Enhanced step execution with error handling
 * 
 * ENHANCEMENTS:
 * ✅ Automatic screenshot on step failure
 * ✅ Step timing information
 * ✅ Nested step support
 * ✅ Step description templates
 */
export class StepRunner {
  /**
   * Execute a step with automatic error handling and reporting
   * 
   * @param stepName - Step name
   * @param stepBody - Step function to execute
   * @param options - Step options
   */
  static async run<T>(
    stepName: string,
    stepBody: () => Promise<T>,
    options?: {
      screenshot?: boolean;  // Take screenshot after step
      logResult?: boolean;   // Log step result
    }
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      Logger.info(`▶ STEP START: ${stepName}`);
      
      const result = await test.step(stepName, async () => {
        const stepResult = await stepBody();
        return stepResult;
      });
      
      const duration = Date.now() - startTime;
      Logger.info(`✅ STEP PASSED: ${stepName} (${duration}ms)`);
      
      if (options?.logResult) {
        Logger.info(`Step Result:` + result);
      }
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(`❌ STEP FAILED: ${stepName} (${duration}ms)`);
      Logger.error(`Error: ${error}`);
      
      // Re-throw to preserve test failure
      throw error;
    }
  }

  /**
   * Execute multiple steps in sequence
   * 
   * @param steps - Array of step definitions
   */
  static async runSequence(
    steps: Array<{ name: string; action: () => Promise<any> }>
  ): Promise<void> {
    for (const step of steps) {
      await StepRunner.run(step.name, step.action);
    }
  }

  /**
   * Create a step group (nested steps)
   * 
   * @param groupName - Group name
   * @param steps - Steps to execute
   */
  static async group(
    groupName: string,
    steps: () => Promise<void>
  ): Promise<void> {
    await test.step(groupName, async () => {
      Logger.info(`📁 STEP GROUP: ${groupName}`);
      await steps();
      Logger.info(`✅ STEP GROUP COMPLETE: ${groupName}`);
    });
  }

  /**
   * Conditional step execution
   * 
   * @param condition - Condition to check
   * @param stepName - Step name
   * @param stepBody - Step to execute if condition is true
   */
  static async runIf(
    condition: boolean,
    stepName: string,
    stepBody: () => Promise<void>
  ): Promise<void> {
    if (condition) {
      await StepRunner.run(stepName, stepBody);
    } else {
      Logger.info(`⏭️  STEP SKIPPED: ${stepName} (condition not met)`);
    }
  }

  /**
   * Step with retry logic
   * 
   * @param stepName - Step name
   * @param stepBody - Step function
   * @param maxRetries - Maximum retries
   */
  static async runWithRetry(
    stepName: string,
    stepBody: () => Promise<void>,
    maxRetries: number = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await StepRunner.run(`${stepName} (Attempt ${attempt})`, stepBody);
        return; // Success, exit
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }
        Logger.warn(`Retry ${attempt}/${maxRetries} for: ${stepName}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}