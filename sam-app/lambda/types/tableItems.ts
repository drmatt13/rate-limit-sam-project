export type CreditCardsTableItem = {
  valid: {
    B: boolean;
  };
  recurring: {
    B: boolean;
  };
};

export type APIKeysTableItem = {
  api_key: {
    S: string;
  };
  ttl: {
    N: number;
  };
  user_id: {
    S: string;
  };
  tier: {
    S: string;
  };
};
