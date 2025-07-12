export type DetailType = {
  amount: number;
  memo?: string;
  time: Date;
}

export type DetailsType = {
  [date_category: string]: DetailType[] | [];
}

export type ExpenseDataType = {
  [date_category: string]: {
    docId: string;
    amount: number;
  }
}

export type DetailsFromFirestoreType = {
  Amount: number;
  Memo?: string;
  Time: Date;
}

export type ExpenseDataFromFirestoreType = {
  Amount: number;
  Category: string;
  Details?: DetailsFromFirestoreType[] | [];
}

export type GetExpenseDataFromFirestoreType = {
  docId: string,
  date: string,
  decryptedData: ExpenseDataFromFirestoreType
}[]

export type GetExpenseCategoryDataFromFirestoreType = {
  docId: string,
  decryptedData: ExpenseCategoryDataFromFirestoreType
}

export type ExpenseCategoryDataFromFirestoreType = {
  Category: string;
  OrderNo: number;
}[]

export type ExpenseCategoriesDataType = {
  category: string;
  orderNo: number;
}[]

export type ExpenseCategoryDataType = {
  docId: string;
  categories: ExpenseCategoriesDataType
}