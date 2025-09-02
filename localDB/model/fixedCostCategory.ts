import { ComLocalDBType } from "../type";

export interface FixedCostCategory extends ComLocalDBType {
  PlainText: FixedCostCategoryPlainType[],
}

type FixedCostCategoryPlainType = {
  Category: string;
  OrderNo: number;
  CarryOver?: boolean;
}