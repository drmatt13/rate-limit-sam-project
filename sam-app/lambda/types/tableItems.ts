export type CreditCardsTableItem = {
  user_id: {
    S: string;
  };
  valid: {
    BOOL: boolean;
  };
  recurring: {
    BOOL: boolean;
  };
  nextPayment: {
    S: string;
  };
};

export type PaymentTableItem = {
  user_id: {
    S: string;
  };
  amount: {
    N: string;
  };
  date: {
    S: string;
  };
};

export type APIKeysTableItem = {
  user_id: {
    S: string;
  };
  api_key: {
    S: string;
  };
  tier: {
    S: string;
  };
};
