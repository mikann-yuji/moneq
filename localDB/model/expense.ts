import { ComLocalDBType } from "../type";

export interface Expense extends ComLocalDBType {
  PlainText: ExpensePlainType,
  Date: Date,
}

type DetailPlainType = {
  Amount: number;
  Memo?: string;
  Time: Date;
}

type ExpensePlainType = {
  Amount: number;
  Category: string;
  Details?: DetailPlainType[] | [];
}