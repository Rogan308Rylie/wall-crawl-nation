export type Coupon = {
  id?: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
};
