'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, addDoc, collection, Query, getDocs } from 'firebase/firestore';
import useSWR from 'swr';
import { DetailsType, DetailType, ExpenseDataFromFirestoreType, ExpenseDataType, GetExpenseDataFromFirestoreType } from '@/types/expenseType';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useRouter } from 'next/navigation';
import { encryptData, decryptData, uint8ArrayToBase64, arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8Array } from '@/utils/crypto';

interface ExpenseContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  expenseDatas: ExpenseDataType;
  setExpenseData: (docId: string, pKey: string, amount: number) => void;
  detailDatas: DetailsType;
  setDetailData: (pKey: string, detailData: DetailType) => void;
  setDetailDataArray: (pKey: string, detailDatas: DetailType[]) => void;
  getAndSetExpenseData: (query: Query, dek: CryptoKey) => Promise<void>;
  getExpenseData: (query: Query, dek: CryptoKey) => Promise<GetExpenseDataFromFirestoreType>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const fetcher = async (docId: string) => {
  const docRef = doc(db, 'Expenses', docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().Amount || 0 : 0;
};

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { dek } = useDek();
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [expenseDatas, setExpenseDatas] = useState<ExpenseDataType>({});
  const [detailDatas, setDetailDatas] = useState<DetailsType>({});
  const [contextPKey, setContextPKey] = useState<string>('');

  // const getAmount = async (docId: string) => {
  //   const { data } = useSWR(docId, fetcher);
  //   if (data !== undefined) {
  //     setAmounts(prev => ({ ...prev, [docId]: data }));
  //   }
  //   return data || 0;
  // };

  const getExpenseData = async (query: Query, dek: CryptoKey): Promise<GetExpenseDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const dataArray: GetExpenseDataFromFirestoreType = []; // 型を明示的に指定
    await Promise.all(querySnapshot.docs.map(async (doc) => { // forEachをPromise.allに変更
      const data = doc.data();
      const decryptedData = await decryptData<ExpenseDataFromFirestoreType>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      const date = format(data.Date.toDate(), 'yyyy-M-d');
      const docId = doc.id;
      dataArray.push({ docId, date, decryptedData });
    }));
    return dataArray;
  }

  const getAndSetExpenseData = async (query: Query, dek: CryptoKey) => {
    const dataArray = await getExpenseData(query, dek);
    dataArray.forEach(data => setExpenseDataFromFirestore(data.docId, data.date, data.decryptedData));
  }

  const setExpenseData = (docId: string, pKey: string, amount: number) => {
    setExpenseDatas(prev => ({
      ...prev,
      [pKey]: {
        docId: docId,
        amount: amount
      }
    }));
    setContextPKey(pKey);
  }

  const setDetailData = (pKey: string, detailData: DetailType) => {
    setDetailDatas(prev => {
      return {
        ...prev,
        [pKey]: [...(prev[pKey] || []), detailData]
      }
    });
    setContextPKey(pKey);
  }

  const setDetailDataArray = (pKey: string, detailDatas: DetailType[]) => {
    setDetailDatas(prev => {
      return {
        ...prev,
        [pKey]: detailDatas
      }
    });
    setContextPKey(pKey);
  }
  
  const setExpenseDataFromFirestore = (docId: string, date: string, data: ExpenseDataFromFirestoreType) => {
    console.log(date);
    setExpenseDatas(prev => ({
      ...prev,
      [`${date}_${data.Category}`]: {
        docId: docId,
        amount: data.Amount,
      }
    }))
    setDetailDatas(prev => ({
      ...prev,
      [`${date}_${data.Category}`]: data.Details?.map((detail) => ({
        amount: detail.Amount,
        memo: detail.Memo,
        time: detail.Time,
      })) || []
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      const expenseData = expenseDatas[contextPKey];
      const docId = expenseData?.docId;
      const [date, category] = contextPKey.split('_');
      await createAndUpdateExpenseData(docId, date, category);
    };
    if (contextPKey) {
      fetchData();
    }
    console.log(detailDatas);
  }, [expenseDatas, contextPKey, detailDatas]);

  const createAndUpdateExpenseData = async (docId: string, date: string, category: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const rawExpenseData: ExpenseDataFromFirestoreType = {
      Amount: expenseDatas[contextPKey]?.amount,
      Category: category,
      Details: detailDatas[contextPKey]?.map(detail => ({
        Amount: detail.amount,
        Memo: detail.memo,
        Time: detail.time
      }))
    }

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawExpenseData, dek);
      if (docId) {
        const docRef = doc(db, 'Expenses', docId);
  
        await setDoc(docRef, {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          Date: new Date(year, month - 1, day),
          UpdatedAt: new Date()
        }, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'Expenses'), {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          Date: new Date(year, month - 1, day),
          CreatedAt: new Date(),
          UpdatedAt: new Date()
        });
        expenseDatas[contextPKey].docId = docRef.id;
      }
    }
  }

  return (
    <ExpenseContext.Provider value={{
      selectedYear,
      setSelectedYear,
      selectedMonth,
      setSelectedMonth,
      expenseDatas,
      setExpenseData,
      detailDatas,
      setDetailData,
      setDetailDataArray,
      getAndSetExpenseData,
      getExpenseData,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
} 