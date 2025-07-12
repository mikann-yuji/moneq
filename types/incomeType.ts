export type IncomeDataType = {
  [date_category: string]: {
    docId: string;
    amount: number;
  }
}

export type IncomeDataFromFirestoreType = {
  Amount: number;
  Category: string;
}

export type GetIncomeDataFromFirestoreType = {
  docId: string,
  date: Date,
  decryptedData: IncomeDataFromFirestoreType
}[]

export type IncomeCategoryType = {
  Category: string,
  OrderNo: number
}

export type GetIncomeCategoryDataFromFirestoreType = {
  docId: string,
  decryptedData: IncomeCategoryDataFromFirestoreType
}

export type IncomeCategoryDataFromFirestoreType = {
  Category: string;
  OrderNo: number;
}[]

export type IncomeCategoriesDataType = {
  category: string;
  orderNo: number;
}[]

export type IncomeCategoryDataType = {
  docId: string;
  categories: IncomeCategoriesDataType
}