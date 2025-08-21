import { ComLocalDBType } from "../type";

export interface FixedCost extends ComLocalDBType {
  PlainText: FixedCostPlainType,
  Date: Date,
}

type FixedCostPlainType = {
  Amount: number;
  Category: string;
}