export type MemoDataType = {
  [date: string]: {
    docId: string;
    memo: string;
  }
}

export type MemoDataFromFirestoreType = {
  Memo: string;
}

export type GetMemoDataFromFirestoreType = {
  docId: string,
  date: Date,
  decryptedData: MemoDataFromFirestoreType
}[]