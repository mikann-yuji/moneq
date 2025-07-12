'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection, Query, getDocs, where, query } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { encryptData, decryptData, uint8ArrayToBase64, arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8Array } from '@/utils/crypto';
import { FixedCostBudgetDataFromFirestoreType, FixedCostBudgetDataType, GetFixedCostBudgetDataFromFirestoreType } from '@/types/fixedCostBudgetType';

interface FixedCostBudgetContextType {
  setFixedCostBudgetData: (docId: string, pKey: string, amount: number, isSubmit?: boolean) => void;
  fixedCostBudgetDatas: FixedCostBudgetDataType;
  getAndSetFixedCostBudgetData: (query: Query, dek: CryptoKey) => Promise<void>;
}

const FixedCostBudgetContext = createContext<FixedCostBudgetContextType | undefined>(undefined);

export function FixedCostBudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { dek } = useDek();
  const [contextPKey, setContextPKey] = useState<string>('');
  const [fixedCostBudgetDatas, setFixedCostBudgetDatas] = useState<FixedCostBudgetDataType>({});
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const fixedCostBudgetData = fixedCostBudgetDatas[contextPKey];
      const docId = fixedCostBudgetData?.docId;
      const category = contextPKey;
      await createAndUpdateFixedCostBudgetData(docId, category);
    };
    if (contextPKey && isSubmit) {
      fetchData();
    }
  }, [fixedCostBudgetDatas, contextPKey, isSubmit]);
  
  useEffect(() => {
    const q = query(
      collection(db, 'FixedCostBudgets'),
      where('UserId', '==', user?.uid || '')
    );

    if (dek) {
      getAndSetFixedCostBudgetData(q, dek);
    }
  }, [dek]);

  const setFixedCostBudgetData = (docId: string, pKey: string, amount: number, isSubmit: boolean = false) => {
    setFixedCostBudgetDatas(prev => ({
      ...prev,
      [pKey]: {
        docId: docId,
        amount: amount
      }
    }));
    setContextPKey(pKey);
    setIsSubmit(isSubmit);
  }

  const getFixedCostBudgetData = async (query: Query, dek: CryptoKey): Promise<GetFixedCostBudgetDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const dataArray: GetFixedCostBudgetDataFromFirestoreType = [];
    await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const decryptedData = await decryptData<FixedCostBudgetDataFromFirestoreType>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      const docId = doc.id;
      dataArray.push({ docId, decryptedData });
    }));
    return dataArray;
  }

  const setFixedCostBudgetDataFromFirestore = (docId: string, data: FixedCostBudgetDataFromFirestoreType) => {
    setFixedCostBudgetDatas(prev => ({
      ...prev,
      [data.Category]: {
        docId: docId,
        amount: data.Amount
      }
    }));
  }

  const getAndSetFixedCostBudgetData = async (query: Query, dek: CryptoKey) => {
    const dataArray = await getFixedCostBudgetData(query, dek);
    dataArray.forEach(data => setFixedCostBudgetDataFromFirestore(data.docId, data.decryptedData));
  }

  const createAndUpdateFixedCostBudgetData = async (docId: string, category: string) => {
    const rawFixedCostBudgetData: FixedCostBudgetDataFromFirestoreType = {
      Amount: fixedCostBudgetDatas[contextPKey]?.amount,
      Category: category,
    }

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawFixedCostBudgetData, dek);
      if (docId) {
        const docRef = doc(db, 'FixedCostBudgets', docId);
  
        await setDoc(docRef, {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          UpdatedAt: new Date()
        }, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'FixedCostBudgets'), {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          CreatedAt: new Date(),
          UpdatedAt: new Date()
        });
        fixedCostBudgetDatas[contextPKey].docId = docRef.id;
      }
    }
  }

  return (
    <FixedCostBudgetContext.Provider value={{
      fixedCostBudgetDatas,
      setFixedCostBudgetData,
      getAndSetFixedCostBudgetData
    }}>
      {children}
    </FixedCostBudgetContext.Provider>
  );
}

export function useFixedCostBudget() {
  const context = useContext(FixedCostBudgetContext);
  if (context === undefined) {
    throw new Error('useFixedCostBudget must be used within an FixedCostBudgetProvider');
  }
  return context;
} 