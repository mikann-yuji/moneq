export type ExpenseBudgetDataType = {
  [category: string]: {
    docId: string;
    amount: number;
  }
}

export type ExpenseBudgetDataFromFirestoreType = {
  Amount: number;
  Category: string;
}

export type GetExpenseBudgetDataFromFirestoreType = {
  docId: string,
  decryptedData: ExpenseBudgetDataFromFirestoreType
}[]
