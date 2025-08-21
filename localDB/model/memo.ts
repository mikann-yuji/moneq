import { ComLocalDBType } from "../type";

export interface Memo extends ComLocalDBType {
  PlainText: MemoCategoryPlainType,
  Date: Date,
}

type MemoCategoryPlainType = {
  Memo: string;
}