import { ComLocalDBType } from "../type";

export interface ExpenseBudget extends ComLocalDBType {
  PlainText: ExpenseBudgetPlainType,
}

type ExpenseBudgetPlainType = {
  Amount: number;
  Category: string;
}