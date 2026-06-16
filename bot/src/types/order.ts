export const ORDER_TRANSITIONS = {
  CREATED: ["PENDING"],
  PENDING: ["PAID"],
  PAID: ["DELIVERED"],
  DELIVERED: []
} as const;

export type OrderStatus = keyof typeof ORDER_TRANSITIONS;
