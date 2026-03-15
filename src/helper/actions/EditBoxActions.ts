import { Locator, Page } from '@playwright/test';
import { PageActions } from './PageActions';
import { LocatorFactory } from './LocatorFactory';
import { Logger } from '@helper/logger/Logger';

/**
 * EditBoxActions - Input field interaction utilities
 * 
 * MIGRATION NOTES:
 * - Now instance-based, receives PageActions in constructor
 */
export class EditBoxActions {
  private pageActions: PageActions;

  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Fill input field
   */
  public async fill(input: string | Locator, value: string): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Filling input with: ${value}`);
    await locator.fill(value);
  }

  /**
   * Type text with delay (simulates typing)
   */
  public async type(input: string | Locator, text: string, delay: number = 100): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Typing: ${text} with delay ${delay}ms`);
    await locator.type(text, { delay });
  }

  /**
   * Clear input field
   */
  public async clear(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info('Clearing input field');
    await locator.clear();
  }

  /**
   * Get input value
   */
  public async getValue(input: string | Locator): Promise<string> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const value = await locator.inputValue();
    Logger.info(`Input value: ${value}`);
    return value;
  }

  /**
   * Fill and press key (e.g., fill and press Enter)
   */
  public async fillAndPressKey(
    input: string | Locator,
    value: string,
    key: string
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Filling input with: ${value} and pressing ${key}`);
    await locator.fill(value);
    await locator.press(key);
  }

  /**
   * Fill and blur (trigger blur event)
   */
  public async fillAndBlur(input: string | Locator, value: string): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Filling input and triggering blur: ${value}`);
    await locator.fill(value);
    await locator.blur();
  }

  /**
   * Upload file
   */
  public async uploadFile(input: string | Locator, filePath: string | string[]): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Uploading file(s): ${filePath}`);
    await locator.setInputFiles(filePath);
  }

  /**
   * Clear file upload
   */
  public async clearFileUpload(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info('Clearing file upload');
    await locator.setInputFiles([]);
  }
}
