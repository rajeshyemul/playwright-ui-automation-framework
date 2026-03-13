import { test } from '@playwright/test';
import { AllureMeta } from './AllureMeta';
import { Logger } from '@helper/logger/Logger';
import * as fs from 'fs';

/**
 * AllureReporter - Enhanced Allure reporting utilities
 *
 * ENHANCEMENTS:
 * ✅ Auto-attach screenshots on failure
 * ✅ Auto-attach videos on failure
 * ✅ Support for custom attachments
 * ✅ Step wrapping with error handling
 * ✅ Metadata helpers
 */
export class AllureReporter {
  /**
   * Attach test metadata (Epic, Feature, Story, Severity, etc.)
   *
   * USAGE:
   * await AllureReporter.attachDetails({
   *   epic: Epic.UI_TESTING,
   *   feature: Feature.PAGE_LOAD,
   *   story: 'User can load home page',
   *   severity: Severity.CRITICAL,
   *   owner: TestOwners.USER_01,
   *   description: 'Test description',
   *   tags: ['smoke', 'home'],
   *   issues: ['JIRA-123'],
   *   tmsIds: ['TC-001'],
   *   links: [{ name: 'Documentation', url: 'https://playwright.dev' }]
   * });
   *
   * NOTE: Currently using annotations for all metadata since labels property
   * is not available in this Playwright version. Future versions may support
   * proper labels vs annotations separation.
   */
  static async attachDetails(meta: AllureMeta): Promise<void> {
    // Core Allure metadata - using annotations (labels property not available in this Playwright version)
    // Ideally these should be labels: test.info().labels.push({ name: 'epic', value: meta.epic })
    // But for now using annotations which Allure will still process
    if (meta.epic) {
      test.info().annotations.push({ type: 'epic', description: meta.epic });
    }
    if (meta.feature) {
      test.info().annotations.push({ type: 'feature', description: meta.feature });
    }
    if (meta.severity) {
      test.info().annotations.push({ type: 'severity', description: meta.severity });
    }
    if (meta.owner) {
      test.info().annotations.push({ type: 'owner', description: meta.owner });
    }
    if (meta.component) {
      test.info().annotations.push({ type: 'component', description: meta.component });
    }
    if (meta.story) {
      if (Array.isArray(meta.story)) {
        meta.story.forEach((story) =>
          test.info().annotations.push({ type: 'story', description: story })
        );
      } else {
        test.info().annotations.push({ type: 'story', description: meta.story });
      }
    }
    if (meta.tags) {
      meta.tags.forEach((tag) => test.info().annotations.push({ type: 'tag', description: tag }));
    }

    // External references - properly using annotations
    if (meta.issues) {
      meta.issues.forEach((issue) =>
        test.info().annotations.push({ type: 'issue', description: issue })
      );
    }
    if (meta.tmsIds) {
      meta.tmsIds.forEach((tmsId) =>
        test.info().annotations.push({ type: 'tms', description: tmsId })
      );
    }
    if (meta.links) {
      meta.links.forEach((link) =>
        test.info().annotations.push({ type: 'link', description: `${link.name}: ${link.url}` })
      );
    }
    if (meta.description) {
      test.info().annotations.push({ type: 'description', description: meta.description });
    }

    Logger.info(
      `Allure metadata attached: ${meta.epic || ''} > ${meta.feature || ''} > ${Array.isArray(meta.story) ? meta.story.join(', ') : meta.story || ''}`
    );
  }

  /**
   * Create a step in Allure report
   *
   * USAGE:
   * await AllureReporter.step('Login to application', async () => {
   *   await loginPage.login(username, password);
   * });
   */
  static async step<T>(name: string, body: () => Promise<T>): Promise<T> {
    Logger.info(`📍 STEP: ${name}`);
    return await test.step(name, body);
  }

  /**
   * Attach screenshot to Allure report
   *
   * @param name - Screenshot name
   * @param screenshot - Buffer or path to screenshot
   */
  static async attachScreenshot(name: string, screenshot: Buffer | string): Promise<void> {
    try {
      let buffer: Buffer;

      if (typeof screenshot === 'string') {
        // It's a file path
        buffer = fs.readFileSync(screenshot);
      } else {
        // It's already a buffer
        buffer = screenshot;
      }

      await test.info().attach(name, {
        body: buffer,
        contentType: 'image/png',
      });

      Logger.info(`Screenshot attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach screenshot: ${error}`);
    }
  }

  /**
   * Attach video to Allure report
   *
   * @param name - Video name
   * @param videoPath - Path to video file
   */
  static async attachVideo(name: string, videoPath: string): Promise<void> {
    try {
      if (!fs.existsSync(videoPath)) {
        Logger.warn(`Video file not found: ${videoPath}`);
        return;
      }

      const videoBuffer = fs.readFileSync(videoPath);

      await test.info().attach(name, {
        body: videoBuffer,
        contentType: 'video/webm',
      });

      Logger.info(`Video attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach video: ${error}`);
    }
  }

  /**
   * Attach text content to Allure report
   *
   * @param name - Attachment name
   * @param content - Text content
   */
  static async attachText(name: string, content: string): Promise<void> {
    try {
      await test.info().attach(name, {
        body: content,
        contentType: 'text/plain',
      });

      Logger.info(`Text attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach text: ${error}`);
    }
  }

  /**
   * Attach JSON data to Allure report
   *
   * @param name - Attachment name
   * @param data - JSON data
   */
  static async attachJSON(name: string, data: any): Promise<void> {
    try {
      const jsonString = JSON.stringify(data, null, 2);

      await test.info().attach(name, {
        body: jsonString,
        contentType: 'application/json',
      });

      Logger.info(`JSON attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach JSON: ${error}`);
    }
  }

  /**
   * Attach HTML content to Allure report
   *
   * @param name - Attachment name
   * @param html - HTML content
   */
  static async attachHTML(name: string, html: string): Promise<void> {
    try {
      await test.info().attach(name, {
        body: html,
        contentType: 'text/html',
      });

      Logger.info(`HTML attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach HTML: ${error}`);
    }
  }

  /**
   * Add a link to Allure report
   *
   * @param name - Link name
   * @param url - URL
   */
  static addLink(name: string, url: string): void {
    test.info().annotations.push({ type: 'link', description: `${name}: ${url}` });
    Logger.info(`Link added: ${name} -> ${url}`);
  }

  /**
   * Add an issue link to Allure report
   *
   * @param issueId - Issue ID (e.g., JIRA-123)
   */
  static addIssue(issueId: string): void {
    test.info().annotations.push({ type: 'issue', description: issueId });
    Logger.info(`Issue linked: ${issueId}`);
  }

  /**
   * Add a test management system link
   *
   * @param tmsId - TMS ID
   */
  static addTMS(tmsId: string): void {
    test.info().annotations.push({ type: 'tms', description: tmsId });
    Logger.info(`TMS linked: ${tmsId}`);
  }

  /**
   * Add description to test
   *
   * @param description - Test description
   */
  static async addDescription(description: string): Promise<void> {
    test.info().annotations.push({ type: 'description', description });
  }

  /**
   * Add tags to test
   *
   * @param tags - Array of tags
   */
  static async addTags(tags: string[]): Promise<void> {
    tags.forEach((tag) => {
      test.info().annotations.push({ type: 'tag', description: tag });
    });
  }

  /**
   * Log environment information to Allure
   */
  static logEnvironmentInfo(): void {
    const envInfo = {
      'Node Version': process.version,
      Platform: process.platform,
      OS: process.arch,
      Environment: process.env.ENV || 'dev',
      'Base URL': process.env.BASE_URL || 'Not set',
    };

    Logger.info(`Environment Info: ${JSON.stringify(envInfo)}`);
  }
}
