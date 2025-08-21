import { ComLocalDBType } from "../type";

export interface ExpenseCategory extends ComLocalDBType {
  PlainText: ExpenseCategoryPlainType[],
}

type ExpenseCategoryPlainType = {
  Category: string;
  OrderNo: number;
}