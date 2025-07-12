export type FixedCostBudgetDataType = {
  [category: string]: {
    docId: string;
    amount: number;
  }
}

export type FixedCostBudgetDataFromFirestoreType = {
  Amount: number;
  Category: string;
}

export type GetFixedCostBudgetDataFromFirestoreType = {
  docId: string,
  decryptedData: FixedCostBudgetDataFromFirestoreType
}[]
