'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, addDoc, collection, Query, getDocs, where, query } from 'firebase/firestore';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useRouter } from 'next/navigation';
import { encryptData, decryptData, uint8ArrayToBase64, arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8Array } from '@/utils/crypto';
import { ExpenseBudgetDataFromFirestoreType, ExpenseBudgetDataType, GetExpenseBudgetDataFromFirestoreType } from '@/types/expenseBudgetType';

interface ExpenseBudgetContextType {
  setExpenseBudgetData: (docId: string, pKey: string, amount: number, isSubmit?: boolean) => void;
  expenseBudgetDatas: ExpenseBudgetDataType;
  getAndSetExpenseBudgetData: (query: Query, dek: CryptoKey) => Promise<void>;
}

const ExpenseBudgetContext = createContext<ExpenseBudgetContextType | undefined>(undefined);

export function ExpenseBudgetProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { dek } = useDek();
  const router = useRouter();
  const [contextPKey, setContextPKey] = useState<string>('');
  const [expenseBudgetDatas, setExpenseBudgetDatas] = useState<ExpenseBudgetDataType>({});
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const expenseBudgetData = expenseBudgetDatas[contextPKey];
      const docId = expenseBudgetData?.docId;
      const category = contextPKey;
      await createAndUpdateExpenseBudgetData(docId, category);
    };
    if (contextPKey && isSubmit) {
      fetchData();
    }
  }, [expenseBudgetDatas, contextPKey, isSubmit]);

  useEffect(() => {
    const q = query(
      collection(db, 'ExpenseBudgets'),
      where('UserId', '==', user?.uid || '')
    );

    if (dek) {
      getAndSetExpenseBudgetData(q, dek);
    }
  }, [dek]);

  const setExpenseBudgetData = (docId: string, pKey: string, amount: number, isSubmit: boolean = false) => {
    console.log(pKey);
    setExpenseBudgetDatas(prev => ({
      ...prev,
      [pKey]: {
        docId: docId,
        amount: amount
      }
    }));
    setContextPKey(pKey);
    setIsSubmit(isSubmit);
  }

  const getExpenseBudgetData = async (query: Query, dek: CryptoKey): Promise<GetExpenseBudgetDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const dataArray: GetExpenseBudgetDataFromFirestoreType = [];
    await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const decryptedData = await decryptData<ExpenseBudgetDataFromFirestoreType>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      const docId = doc.id;
      dataArray.push({ docId, decryptedData });
    }));
    return dataArray;
  }

  const setExpenseBudgetDataFromFirestore = (docId: string, data: ExpenseBudgetDataFromFirestoreType) => {
    setExpenseBudgetDatas(prev => ({
      ...prev,
      [data.Category]: {
        docId: docId,
        amount: data.Amount
      }
    }));
  }

  const getAndSetExpenseBudgetData = async (query: Query, dek: CryptoKey) => {
    const dataArray = await getExpenseBudgetData(query, dek);
    dataArray.forEach(data => setExpenseBudgetDataFromFirestore(data.docId, data.decryptedData));
  }

  const createAndUpdateExpenseBudgetData = async (docId: string, category: string) => {
    const rawExpenseBudgetData: ExpenseBudgetDataFromFirestoreType = {
      Amount: expenseBudgetDatas[contextPKey]?.amount,
      Category: category,
    }

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawExpenseBudgetData, dek);
      if (docId) {
        const docRef = doc(db, 'ExpenseBudgets', docId);
  
        await setDoc(docRef, {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          UpdatedAt: new Date()
        }, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'ExpenseBudgets'), {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          CreatedAt: new Date(),
          UpdatedAt: new Date()
        });
        expenseBudgetDatas[contextPKey].docId = docRef.id;
      }
    }
  }

  return (
    <ExpenseBudgetContext.Provider value={{
      expenseBudgetDatas,
      setExpenseBudgetData,
      getAndSetExpenseBudgetData
    }}>
      {children}
    </ExpenseBudgetContext.Provider>
  );
}

export function useExpenseBudget() {
  const context = useContext(ExpenseBudgetContext);
  if (context === undefined) {
    throw new Error('useExpenseBudget must be used within an ExpenseBudgetProvider');
  }
  return context;
} 