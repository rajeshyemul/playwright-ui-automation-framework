import { Locator, Page, selectors } from '@playwright/test';
import { PageActions } from './PageActions';

/**
 * LocatorFactory - Utility for creating Playwright Locators
 * 
 * MIGRATION NOTES:
 * - OLD: Static class accessing global pageFixture ❌
 * - NEW: Utility methods accepting Page instance ✅
 * 
 * TWO WAYS TO USE:
 * 1. Pass PageActions: LocatorFactory.getLocator(pageActions, selector)
 * 2. Pass Page directly: LocatorFactory.getLocator(page, selector)
 * 
 * ALTERNATIVE:
 * In most cases, you can use page.locator() directly in your page objects
 * since BasePage provides access to this.page
 */
export class LocatorFactory {
  /**
   * Get page instance from PageActions or use Page directly
   * 
   * @param source - PageActions instance or Page instance
   * @returns Page instance
   */
  private static getPage(source: PageActions | Page): Page {
    if (source instanceof PageActions) {
      // It's PageActions
      return source.getPage();
    }
    // It's already a Page
    return source;
  }

  /**
   * Returns a Locator object based on the input provided
   * 
   * @param source - PageActions or Page instance
   * @param input - Selector string or existing Locator
   * @returns Locator
   * 
   * USAGE:
   * const locator = LocatorFactory.getLocator(pageActions, '.my-button');
   * const locator = LocatorFactory.getLocator(this.page, '.my-button');
   */
  public static getLocator(source: PageActions | Page, input: string | Locator): Locator {
    if (typeof input === 'string') {
      const page = this.getPage(source);
      return page.locator(input);
    }
    return input;
  }

  /**
   * Returns a Locator object with a specific testId
   * 
   * @param source - PageActions or Page instance
   * @param testId - The testId to create the Locator from
   * @param attributeName - Optional attribute name for the testId
   * 
   * USAGE:
   * const locator = LocatorFactory.getLocatorByTestId(pageActions, 'submit-btn');
   */
  public static getLocatorByTestId(
    source: PageActions | Page,
    testId: string | RegExp,
    attributeName?: string
  ): Locator {
    if (attributeName) {
      selectors.setTestIdAttribute(attributeName);
    }
    const page = this.getPage(source);
    return page.getByTestId(testId);
  }

  /**
   * Returns a Locator object with specific text
   * 
   * @param source - PageActions or Page instance
   * @param text - Text to search for
   */
  public static getLocatorByText(source: PageActions | Page, text: string | RegExp): Locator {
    const page = this.getPage(source);
    return page.getByText(text);
  }

  /**
   * Returns a Locator object with specific label
   */
  public static getLocatorByLabel(source: PageActions | Page, text: string | RegExp): Locator {
    const page = this.getPage(source);
    return page.getByLabel(text);
  }

  /**
   * Returns a Locator object with specific placeholder
   */
  public static getLocatorByPlaceholder(source: PageActions | Page, text: string | RegExp): Locator {
    const page = this.getPage(source);
    return page.getByPlaceholder(text);
  }

  /**
   * Returns a Locator object with specific title
   */
  public static getLocatorByTitle(source: PageActions | Page, text: string | RegExp): Locator {
    const page = this.getPage(source);
    return page.getByTitle(text);
  }

  /**
   * Returns a Locator object with specific alt text
   */
  public static getLocatorByAltText(source: PageActions | Page, text: string | RegExp): Locator {
    const page = this.getPage(source);
    return page.getByAltText(text);
  }

  /**
   * Returns a Locator object for a role
   */
  public static getLocatorByRole(
    source: PageActions | Page,
    role: 'button' | 'link' | 'textbox' | 'heading' | 'img' | 'list' | 'listitem',
    options?: { name?: string | RegExp }
  ): Locator {
    const page = this.getPage(source);
    return page.getByRole(role, options);
  }

  /**
   * Returns all Locator objects based on the input provided
   * 
   * @param source - PageActions or Page instance
   * @param input - Selector string or existing Locator
   */
  public static async getAllLocators(
    source: PageActions | Page,
    input: string | Locator
  ): Promise<Locator[]> {
    if (typeof input === 'string') {
      const page = this.getPage(source);
      return await page.locator(input).all();
    }
    return await input.all();
  }
}