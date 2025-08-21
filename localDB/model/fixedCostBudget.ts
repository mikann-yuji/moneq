import { ComLocalDBType } from "../type";

export interface FixedCostBudget extends ComLocalDBType {
  PlainText: FixedCostBudgetPlainType,
}

type FixedCostBudgetPlainType = {
  Amount: number;
  Category: string;
}