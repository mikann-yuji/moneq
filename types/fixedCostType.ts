export type FixedCostDataType = {
  [date_category: string]: {
    docId: string;
    amount: number;
  }
}

export type FixedCostDataFromFirestoreType = {
  Amount: number;
  Category: string;
}

export type GetFixedCostDataFromFirestoreType = {
  docId: string,
  date: Date,
  decryptedData: FixedCostDataFromFirestoreType
}[]

export type FixedCostCategoryType = {
  Category: string,
  OrderNo: number
}

export type GetFixedCostCategoryDataFromFirestoreType = {
  docId: string,
  decryptedData: FixedCostCategoryDataFromFirestoreType
}

export type FixedCostCategoryDataFromFirestoreType = {
  Category: string;
  OrderNo: number;
}[]

export type FixedCostCategoriesDataType = {
  category: string;
  orderNo: number;
}[]

export type FixedCostCategoryDataType = {
  docId: string;
  categories: FixedCostCategoriesDataType
}