import { ComLocalDBType } from "../type";

export interface Income extends ComLocalDBType {
  PlainText: IncomePlainType,
  Date: Date,
}

type IncomePlainType = {
  Amount: number;
  Category: string;
}