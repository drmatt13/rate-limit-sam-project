import { APIKeysTableItem, CreditCardsTableItem } from "./tableItems";
import { DynamoDBError } from "./errors";

export type GetAccountApiKeyResponse = {
  success: boolean;
  tableItem: APIKeysTableItem;
  error: DynamoDBError;
};

export type GetAccountCreditCardResponse = {
  success: boolean;
  tableItem: CreditCardsTableItem;
  error: DynamoDBError;
};

export type EditAccountCreditCardResponse = {
  success: boolean;
  tableItem: CreditCardsTableItem;
  error: DynamoDBError;
};
