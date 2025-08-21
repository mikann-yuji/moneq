import { ComLocalDBType } from "../type";

export interface IncomeCategory extends ComLocalDBType {
  PlainText: IncomeCategoryPlainType[],
}

type IncomeCategoryPlainType = {
  Category: string;
  OrderNo: number;
}