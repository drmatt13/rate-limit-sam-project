export default interface SessionData {
  key?: string;
  tier?: "free" | "paid";
  cardStatus?: "no card" | "invalid" | "valid";
  recurringBilling?: boolean;
  ttl?: number;
  payments?: Array<{
    amount: number;
    date: string;
  }>;
}
