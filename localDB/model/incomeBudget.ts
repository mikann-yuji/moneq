import { ComLocalDBType } from "../type";

export interface IncomeBudget extends ComLocalDBType {
  PlainText: IncomeBudgetPlainType,
}

type IncomeBudgetPlainType = {
  Amount: number;
  Category: string;
}