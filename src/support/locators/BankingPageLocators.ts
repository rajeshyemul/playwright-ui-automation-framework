export class AccountOverviewPageLocators {
  static readonly ACCOUNT_TABLE = '#accountTable';
  static readonly ACCOUNT_LINK = '#accountTable tbody tr td a';
  static readonly ACCOUNT_BALANCE = '.ng-binding';
  static readonly ACCOUNT_NUMBER = 'td a';
  static readonly ACCOUNT_TYPE = 'td:nth-child(2)';
  static readonly WELCOME_MESSAGE = '#rightPanel h1';
  static readonly ACCOUNT_SUMMARY = '#accountSummary';
  static readonly ACCOUNT_DETAILS = '#accountDetails';
  static readonly TRANSACTION_TABLE = '#transactionTable';
  static readonly TRANSACTION_ROWS = '#transactionTable tbody tr';
}

export class TransferFundsPageLocators {
  static readonly AMOUNT_FIELD = '[name="amount"]';
  static readonly FROM_ACCOUNT_SELECT = '[name="fromAccountId"]';
  static readonly TO_ACCOUNT_SELECT = '[name="toAccountId"]';
  static readonly TRANSFER_BUTTON = '[value="Transfer"]';
  static readonly SUCCESS_MESSAGE = '#rightPanel .success';
  static readonly ERROR_MESSAGE = '#rightPanel .error';
  static readonly TITLE = '#rightPanel h1';
}

export class BillPayPageLocators {
  static readonly PAYEE_NAME = '[name="payee.name"]';
  static readonly ADDRESS = '[name="payee.address.street"]';
  static readonly CITY = '[name="payee.address.city"]';
  static readonly STATE = '[name="payee.address.state"]';
  static readonly ZIP_CODE = '[name="payee.address.zipCode"]';
  static readonly PHONE = '[name="payee.phoneNumber"]';
  static readonly ACCOUNT_NUMBER = '[name="payee.accountNumber"]';
  static readonly VERIFY_ACCOUNT = '[name="verifyAccount"]';
  static readonly AMOUNT = '[name="amount"]';
  static readonly SEND_PAYMENT_BUTTON = '[value="Send Payment"]';
  static readonly SUCCESS_MESSAGE = '#rightPanel .success';
  static readonly ERROR_MESSAGE = '#rightPanel .error';
  static readonly TITLE = '#rightPanel h1';
}

export class FindTransactionsPageLocators {
  static readonly ACCOUNT_SELECT = '[name="accountId"]';
  static readonly TRANSACTION_ID = '[name="transactionId"]';
  static readonly DATE_RANGE = '[name="dateRange"]';
  static readonly FROM_DATE = '[name="fromDate"]';
  static readonly TO_DATE = '[name="toDate"]';
  static readonly AMOUNT = '[name="amount"]';
  static readonly FIND_TRANSACTIONS_BUTTON = '[value="Find Transactions"]';
  static readonly RESULTS_TABLE = '#transactionTable';
  static readonly NO_RESULTS_MESSAGE = '#rightPanel p';
}

export class UpdateProfilePageLocators {
  static readonly FIRST_NAME = '[name="customer.firstName"]';
  static readonly LAST_NAME = '[name="customer.lastName"]';
  static readonly ADDRESS = '[name="customer.address.street"]';
  static readonly CITY = '[name="customer.address.city"]';
  static readonly STATE = '[name="customer.address.state"]';
  static readonly ZIP_CODE = '[name="customer.address.zipCode"]';
  static readonly PHONE = '[name="customer.phoneNumber"]';
  static readonly UPDATE_BUTTON = '[value="Update Profile"]';
  static readonly SUCCESS_MESSAGE = '#rightPanel .success';
}

export class RequestLoanPageLocators {
  static readonly LOAN_AMOUNT = '[name="amount"]';
  static readonly DOWN_PAYMENT = '[name="downPayment"]';
  static readonly FROM_ACCOUNT = '[name="fromAccountId"]';
  static readonly APPLY_BUTTON = '[value="Apply Now"]';
  static readonly RESULT_MESSAGE = '#rightPanel .success, #rightPanel .error';
  static readonly LOAN_STATUS = '#loanStatus';
}
