'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, addDoc, collection, Query, getDocs, query, where } from 'firebase/firestore';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useRouter } from 'next/navigation';
import { encryptData, decryptData, uint8ArrayToBase64, arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8Array } from '@/utils/crypto';
import { IncomeBudgetDataFromFirestoreType, IncomeBudgetDataType, GetIncomeBudgetDataFromFirestoreType } from '@/types/incomeBudgetType';

interface IncomeBudgetContextType {
  setIncomeBudgetData: (docId: string, pKey: string, amount: number, isSubmit?: boolean) => void;
  incomeBudgetDatas: IncomeBudgetDataType;
  getAndSetIncomeBudgetData: (query: Query, dek: CryptoKey) => Promise<void>;
}

const IncomeBudgetContext = createContext<IncomeBudgetContextType | undefined>(undefined);

export function IncomeBudgetProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { dek } = useDek();
  const router = useRouter();
  const [contextPKey, setContextPKey] = useState<string>('');
  const [incomeBudgetDatas, setIncomeBudgetDatas] = useState<IncomeBudgetDataType>({});
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const incomeBudgetData = incomeBudgetDatas[contextPKey];
      const docId = incomeBudgetData?.docId;
      const category = contextPKey;
      await createAndUpdateIncomeBudgetData(docId, category);
    };
    if (contextPKey && isSubmit) {
      fetchData();
    }
  }, [incomeBudgetDatas, contextPKey, isSubmit]);

  useEffect(() => {
    const q = query(
      collection(db, 'IncomeBudgets'),
      where('UserId', '==', user?.uid || '')
    );

    if (dek) {
      getAndSetIncomeBudgetData(q, dek);
    }
  }, [dek]);
  
  const setIncomeBudgetData = (docId: string, pKey: string, amount: number, isSubmit: boolean = false) => {
    console.log(pKey);
    setIncomeBudgetDatas(prev => ({
      ...prev,
      [pKey]: {
        docId: docId,
        amount: amount
      }
    }));
    setContextPKey(pKey);
    setIsSubmit(isSubmit);
  }

  const getIncomeBudgetData = async (query: Query, dek: CryptoKey): Promise<GetIncomeBudgetDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const dataArray: GetIncomeBudgetDataFromFirestoreType = [];
    await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const decryptedData = await decryptData<IncomeBudgetDataFromFirestoreType>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      const docId = doc.id;
      dataArray.push({ docId, decryptedData });
    }));
    return dataArray;
  }

  const setIncomeBudgetDataFromFirestore = (docId: string, data: IncomeBudgetDataFromFirestoreType) => {
    setIncomeBudgetDatas(prev => ({
      ...prev,
      [data.Category]: {
        docId: docId,
        amount: data.Amount
      }
    }));
  }

  const getAndSetIncomeBudgetData = async (query: Query, dek: CryptoKey) => {
    const dataArray = await getIncomeBudgetData(query, dek);
    dataArray.forEach(data => setIncomeBudgetDataFromFirestore(data.docId, data.decryptedData));
  }

  const createAndUpdateIncomeBudgetData = async (docId: string, category: string) => {
    const rawIncomeBudgetData: IncomeBudgetDataFromFirestoreType = {
      Amount: incomeBudgetDatas[contextPKey]?.amount,
      Category: category,
    }

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawIncomeBudgetData, dek);
      if (docId) {
        const docRef = doc(db, 'IncomeBudgets', docId);
  
        await setDoc(docRef, {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          UpdatedAt: new Date()
        }, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'IncomeBudgets'), {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          CreatedAt: new Date(),
          UpdatedAt: new Date()
        });
        incomeBudgetDatas[contextPKey].docId = docRef.id;
      }
    }
  }

  return (
    <IncomeBudgetContext.Provider value={{
      incomeBudgetDatas,
      setIncomeBudgetData,
      getAndSetIncomeBudgetData
    }}>
      {children}
    </IncomeBudgetContext.Provider>
  );
}

export function useIncomeBudget() {
  const context = useContext(IncomeBudgetContext);
  if (context === undefined) {
    throw new Error('useIncomeBudget must be used within an IncomeBudgetProvider');
  }
  return context;
} 