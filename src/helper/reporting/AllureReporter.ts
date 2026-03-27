import { test } from "@playwright/test";
import * as allure from "allure-js-commons";
import * as fs from "fs";
import { Logger } from "../logger/Logger";
import { AllureMeta } from "./AllureMeta";

const EXPLICIT_DESCRIPTION_SET = Symbol("explicitAllureDescriptionSet");

type AllureTestInfo = ReturnType<typeof test.info> & {
  [EXPLICIT_DESCRIPTION_SET]?: boolean;
};

/**
 * AllureReporter - Enhanced Allure reporting utilities
 *
 * ENHANCEMENTS:
 * Auto-attach screenshots on failure
 * Auto-attach videos on failure
 * Support for custom attachments
 * Step wrapping with error handling
 * Metadata helpers
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
   * Uses the allure-js-commons runtime facade so metadata is emitted in the
   * format expected by the `allure-playwright` reporter.
   */
  static async attachDetails(meta: AllureMeta): Promise<void> {
    const testInfo = test.info() as AllureTestInfo;

    if (meta.owner) {
      await allure.owner(meta.owner);
    }
    if (meta.epic) {
      await allure.epic(meta.epic);
    }
    if (meta.feature) {
      await allure.feature(meta.feature);
    }
    if (meta.severity) {
      await allure.severity(meta.severity);
    }
    if (meta.component) {
      await allure.label("component", meta.component);
    }
    if (meta.story) {
      const stories = Array.isArray(meta.story) ? meta.story : [meta.story];
      for (const story of stories) {
        await allure.story(story);
      }
    }

    if (meta.tags?.length) {
      await allure.tags(...meta.tags);
    }

    if (meta.issues) {
      for (const issue of meta.issues) {
        if (issue.url) {
          await allure.issue(issue.url, issue.id);
          continue;
        }

        await allure.label("issue", issue.id);
      }
    }
    if (meta.tmsIds) {
      for (const tmsId of meta.tmsIds) {
        if (tmsId.url) {
          await allure.tms(tmsId.url, tmsId.id);
          continue;
        }

        await allure.label("tms", tmsId.id);
      }
    }

    if (meta.links) {
      for (const link of meta.links) {
        await allure.link(link.id, link.url);
      }
    }
    if (meta.description) {
      await allure.description(meta.description);
      testInfo[EXPLICIT_DESCRIPTION_SET] = true;
    }

    Logger.info(
      `Allure metadata attached: ${meta.epic || ""} > ${meta.feature || ""} > ${Array.isArray(meta.story) ? meta.story.join(", ") : meta.story || ""}`
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

      if (typeof screenshot === "string") {
        // It's a file path
        buffer = fs.readFileSync(screenshot);
      } else {
        // It's already a buffer
        buffer = screenshot;
      }

      await test.info().attach(name, {
        body: buffer,
        contentType: "image/png"
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

      // ✅ Check file size first
      const stats = fs.statSync(videoPath);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > 50) {
        Logger.warn(`Video file too large (${fileSizeMB.toFixed(2)}MB), skipping attachment: ${videoPath}`);
        await AllureReporter.attachText("video-location", `Video too large to attach. Location: ${videoPath}`);
        return;
      }

      const videoBuffer = fs.readFileSync(videoPath);

      await test.info().attach(name, {
        body: videoBuffer,
        contentType: "video/webm"
      });

      Logger.info(`Video attached: ${name} (${fileSizeMB.toFixed(2)}MB)`);
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
        contentType: "text/plain"
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
  static async attachJSON(name: string, data: unknown): Promise<void> {
    try {
      const jsonString = JSON.stringify(data, null, 2);

      await test.info().attach(name, {
        body: jsonString,
        contentType: "application/json"
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
        contentType: "text/html"
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
    void allure.link(url, name);
    Logger.info(`Link added: ${name} -> ${url}`);
  }

  /**
   * Add an issue link to Allure report
   *
   * @param issueId - Issue ID (e.g., JIRA-123)
   */
  static addIssue(issueId: string, url?: string): void {
    if (url) {
      void allure.issue(url, issueId);
    } else {
      void allure.label("issue", issueId);
    }

    Logger.info(`Issue linked: ${issueId}`);
  }

  /**
   * Add a test management system link
   *
   * @param tmsId - TMS ID
   */
  static addTMS(tmsId: string, url?: string): void {
    if (url) {
      void allure.tms(url, tmsId);
    } else {
      void allure.label("tms", tmsId);
    }

    Logger.info(`TMS linked: ${tmsId}`);
  }

  /**
   * Add description to test
   *
   * @param description - Test description
   */
  static async addDescription(description: string): Promise<void> {
    const testInfo = test.info() as AllureTestInfo;

    if (testInfo[EXPLICIT_DESCRIPTION_SET]) {
      return;
    }

    await allure.description(description);
  }

  /**
   * Add tags to test
   *
   * @param tags - Array of tags
   */
  static async addTags(tags: string[]): Promise<void> {
    if (tags.length) {
      await allure.tags(...tags);
    }
  }

  /**
   * Attach CSV data to Allure report
   *
   * @param name - Attachment name
   * @param data - Array of objects or CSV string
   */
  static async attachCSV(name: string, data: Array<Record<string, unknown>> | string): Promise<void> {
    try {
      let csvContent: string;

      if (typeof data === "string") {
        csvContent = data;
      } else {
        // Convert array of objects to CSV
        const headers = Object.keys(data[0] || {});
        const rows = data.map((obj) => headers.map((h) => obj[h]).join(","));
        csvContent = [headers.join(","), ...rows].join("\n");
      }

      await test.info().attach(name, {
        body: csvContent,
        contentType: "text/csv"
      });

      Logger.info(`CSV attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach CSV: ${error}`);
    }
  }

  /**
   * Log environment information to Allure
   */
  static logEnvironmentInfo(): void {
    const envInfo = {
      "Node Version": process.version,
      Platform: process.platform,
      OS: process.arch,
      Environment: process.env.ENV || "dev",
      "Base URL": process.env.BASE_URL || "Not set"
    };

    Logger.info(`Environment Info: ${JSON.stringify(envInfo)}`);
  }
}
