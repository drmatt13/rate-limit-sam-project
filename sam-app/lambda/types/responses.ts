import {
  APIKeysTableItem,
  CreditCardsTableItem,
  PaymentTableItem,
} from "./tableItems";
import { DynamoDBError } from "./errors";

export type MakeCreditCardPaymentResponse = {
  paymentSuccess: boolean;
  success: boolean;
  error?: DynamoDBError;
};

export type GetAccountCreditCardResponse = {
  success: boolean;
  tableItem?: CreditCardsTableItem;
  error?: DynamoDBError;
};

export type EditAccountCreditCardResponse = {
  success: boolean;
  tableItem?: CreditCardsTableItem;
  error?: DynamoDBError;
};

export type GetAccountPaymentHistoryResponse = {
  success: boolean;
  tableItems: PaymentTableItem[];
  error?: DynamoDBError;
};

export type DeleteAccountResponse = {
  success: boolean;
  error?: DynamoDBError;
};

export type GetAccountApiKeyResponse = {
  success: boolean;
  tableItem?: APIKeysTableItem;
  error?: DynamoDBError;
};

export type ResetAccountApiKeyResponse = {
  success: boolean;
  apiKey?: string;
  error?: DynamoDBError;
};
