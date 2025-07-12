'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, addDoc, collection, Query, getDocs } from 'firebase/firestore';
import useSWR from 'swr';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useRouter } from 'next/navigation';
import { encryptData, decryptData, uint8ArrayToBase64, arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8Array } from '@/utils/crypto';
import { changePrimaryKey, pKeyToDateAndCategory } from '@/utils/changePrimaryKey';
import { IncomeDataFromFirestoreType, IncomeDataType, GetIncomeDataFromFirestoreType } from '@/types/incomeType';
import { PrimaryKeyType } from '@/constants/primaryKey';

interface IncomeContextType {
  setIncomeData: (docId: string, pKey: string, amount: number, isSubmit?: boolean) => void;
  incomeDatas: IncomeDataType;
  getAndSetIncomeData: (query: Query, dek: CryptoKey) => Promise<void>;
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

const fetcher = async (docId: string) => {
  const docRef = doc(db, 'Expenses', docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().Amount || 0 : 0;
};

export function IncomeProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { dek } = useDek();
  const router = useRouter();
  const [contextPKey, setContextPKey] = useState<string>('');
  const [incomeDatas, setIncomeDatas] = useState<IncomeDataType>({});
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const setIncomeData = (docId: string, pKey: string, amount: number, isSubmit: boolean = false) => {
    console.log(pKey);
    setIncomeDatas(prev => ({
      ...prev,
      [pKey]: {
        docId: docId,
        amount: amount
      }
    }));
    setContextPKey(pKey);
    setIsSubmit(isSubmit);
  }

  const getIncomeData = async (query: Query, dek: CryptoKey): Promise<GetIncomeDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const dataArray: GetIncomeDataFromFirestoreType = []; // 型を明示的に指定
    await Promise.all(querySnapshot.docs.map(async (doc) => { // forEachをPromise.allに変更
      const data = doc.data();
      const decryptedData = await decryptData<IncomeDataFromFirestoreType>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      const date = data.Date.toDate();
      const docId = doc.id;
      dataArray.push({ docId, date, decryptedData });
    }));
    return dataArray;
  }

  const setIncomeDataFromFirestore = (docId: string, date: Date, data: IncomeDataFromFirestoreType) => {
    setIncomeDatas(prev => ({
      ...prev,
      [changePrimaryKey(date, data.Category, PrimaryKeyType.MONTH)]: {
        docId: docId,
        amount: data.Amount
      }
    }));
  }

  const getAndSetIncomeData = async (query: Query, dek: CryptoKey) => {
    const dataArray = await getIncomeData(query, dek);
    dataArray.forEach(data => setIncomeDataFromFirestore(data.docId, data.date, data.decryptedData));
  }

  useEffect(() => {
    const fetchData = async () => {
      const incomeData = incomeDatas[contextPKey];
      const docId = incomeData?.docId;
      const [date, category] = pKeyToDateAndCategory(contextPKey);
      await createAndUpdateIncomeData(docId, date, category);
    };
    if (contextPKey && isSubmit) {
      fetchData();
    }
  }, [incomeDatas, contextPKey, isSubmit]);

  const createAndUpdateIncomeData = async (docId: string, date: Date, category: string) => {
    const rawIncomeData: IncomeDataFromFirestoreType = {
      Amount: incomeDatas[contextPKey]?.amount,
      Category: category,
    }
    console.log(incomeDatas[contextPKey]);
    console.log(date);

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawIncomeData, dek);
      if (docId) {
        const docRef = doc(db, 'Incomes', docId);
  
        await setDoc(docRef, {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          Date: date,
          UpdatedAt: new Date()
        }, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'Incomes'), {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          Date: date,
          CreatedAt: new Date(),
          UpdatedAt: new Date()
        });
        incomeDatas[contextPKey].docId = docRef.id;
      }
    }
  }

  return (
    <IncomeContext.Provider value={{
      incomeDatas,
      setIncomeData,
      getAndSetIncomeData
    }}>
      {children}
    </IncomeContext.Provider>
  );
}

export function useIncome() {
  const context = useContext(IncomeContext);
  if (context === undefined) {
    throw new Error('useIncome must be used within an IncomeProvider');
  }
  return context;
} 