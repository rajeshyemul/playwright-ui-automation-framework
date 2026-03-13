export class RegistrationPageLocators {
  static readonly FIRST_NAME = '[name="customer.firstName"]';
  static readonly LAST_NAME = '[name="customer.lastName"]';
  static readonly ADDRESS = '[name="customer.address.street"]';
  static readonly CITY = '[name="customer.address.city"]';
  static readonly STATE = '[name="customer.address.state"]';
  static readonly ZIP_CODE = '[name="customer.address.zipCode"]';
  static readonly PHONE = '[name="customer.phoneNumber"]';
  static readonly SSN = '[name="customer.ssn"]';
  static readonly USERNAME = '[name="customer.username"]';
  static readonly PASSWORD = '[name="customer.password"]';
  static readonly CONFIRM_PASSWORD = '[name="repeatedPassword"]';
  static readonly SUBMIT_BUTTON = 'input[value="Register"]';
  static readonly WELCOME_TITLE = 'h1.title';
  static readonly SUCCESS_PARAGRAPH = '#rightPanel p';
  static readonly ERROR_MESSAGE = '#rightPanel .error';
  static readonly SUCCESS_MESSAGE = '#rightPanel .success';
  static readonly REGISTER_BUTTON = 'input[value="Register"]';

  static readonly ERROR_FIRST_NAME = '#customer\\.firstName\\.errors';
  static readonly ERROR_LAST_NAME = '#customer\\.lastName\\.errors';
  static readonly ERROR_USERNAME = '#customer\\.username\\.errors';
  static readonly ERROR_PASSWORD = '#customer\\.password\\.errors';
  static readonly ERROR_CONFIRM_PASSWORD = '#repeatedPassword\\.errors';
  static readonly ERROR_SSN = '#customer\\.ssn\\.errors';
  static readonly ERROR_ADDRESS = '#customer\\.address\\.street\\.errors';
  static readonly ERROR_CITY = '#customer\\.address\\.city\\.errors';
  static readonly ERROR_STATE = '#customer\\.address\\.state\\.errors';

  static getErrorLocatorByField(field: string): string {
    switch (field) {
      case 'firstName':
        return this.ERROR_FIRST_NAME;
      case 'lastName':
        return this.ERROR_LAST_NAME;
      case 'username':
        return this.ERROR_USERNAME;
      case 'password':
        return this.ERROR_PASSWORD;
      case 'confirm':
        return this.ERROR_CONFIRM_PASSWORD;
      case 'ssn':
        return this.ERROR_SSN;
      case 'address':
        return this.ERROR_ADDRESS;
      case 'city':
        return this.ERROR_CITY;
      case 'state':
        return this.ERROR_STATE;
      default:
        throw new Error(`Unknown error field: ${field}`);
    }
  }

  static getFieldSelectorByLabel(label: string): string {
    switch (label.toLowerCase()) {
      case 'first name':
        return this.FIRST_NAME;
      case 'last name':
        return this.LAST_NAME;
      case 'address':
        return this.ADDRESS;
      case 'city':
        return this.CITY;
      case 'state':
        return this.STATE;
      case 'zip code':
        return this.ZIP_CODE;
      case 'phone number':
        return this.PHONE;
      case 'social security number':
        return this.SSN;
      case 'username':
        return this.USERNAME;
      case 'password':
        return this.PASSWORD;
      case 'confirm password':
        return this.CONFIRM_PASSWORD;
      default:
        throw new Error(`Unknown field label: ${label}`);
    }
  }
}
