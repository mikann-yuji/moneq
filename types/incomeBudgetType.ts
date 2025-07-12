export type IncomeBudgetDataType = {
  [category: string]: {
    docId: string;
    amount: number;
  }
}

export type IncomeBudgetDataFromFirestoreType = {
  Amount: number;
  Category: string;
}

export type GetIncomeBudgetDataFromFirestoreType = {
  docId: string,
  decryptedData: IncomeBudgetDataFromFirestoreType
}[]
