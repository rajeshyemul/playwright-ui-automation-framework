import { UrlConstants } from '../support/constants/urlConstants';
import { Browsers } from '../support/enums/config/Browsers';
import { Environments } from '../support/enums/config/Environments';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ConfigManager is responsible for managing configuration settings
 * such as environment, base URLs, browser type, and headless mode.
 */
export class ConfigManager {
  public static getEnvironment(): Environments {
    const env = process.env.ENVIRONMENT?.toUpperCase() as Environments;
    if (!env || !(env in Environments)) {
      throw new Error('Invalid or missing ENVIRONMENT in .env');
    }
    return env;
  }

  /**
   * Get the base UI URL based on the current environment.
   * @returns {string} The base UI URL for the specified environment.
   */
  public static setBaseUIUrl(): string {
    const env = this.getEnvironment();
    switch (env) {
      case Environments.QA:
      case Environments.DEV:
        return UrlConstants.BASE_URL;
      case Environments.STAGE:
      case Environments.PROD:
        return UrlConstants.BASE_URL;
      default:
        throw new Error('Unhandled environment in getBaseUIUrl');
    }
  }

  /**
   * Get the browser type from environment variables.
   * @returns {Browsers} The browser type.
   */
  public static getBrowser(): Browsers {
    const browser = process.env.BROWSER?.toLowerCase();
    switch (browser) {
      case Browsers.FIREFOX:
        return Browsers.FIREFOX;
      case Browsers.WEBKIT:
        return Browsers.WEBKIT;
      default:
        return Browsers.CHROMIUM;
    }
  }

  /**
   * Determine if tests should run in headless mode.
   * @returns {boolean} True if headless mode is enabled, false otherwise.
   */
  public static isHeadless(): boolean {
    return process.env.HEADLESS === 'true';
  }
}
