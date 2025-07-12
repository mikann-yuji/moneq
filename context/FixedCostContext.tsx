'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection, Query, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { encryptData, decryptData, uint8ArrayToBase64, arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8Array } from '@/utils/crypto';
import { changePrimaryKey, pKeyToDateAndCategory } from '@/utils/changePrimaryKey';
import { FixedCostDataFromFirestoreType, FixedCostDataType, GetFixedCostDataFromFirestoreType } from '@/types/fixedCostType';
import { PrimaryKeyType } from '@/constants/primaryKey';

interface FixedCostContextType {
  setFixedCostData: (docId: string, pKey: string, amount: number, isSubmit?: boolean) => void;
  fixedCostDatas: FixedCostDataType;
  getAndSetFixedCostData: (query: Query, dek: CryptoKey) => Promise<void>;
}

const FixedCostContext = createContext<FixedCostContextType | undefined>(undefined);

export function FixedCostProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { dek } = useDek();
  const [contextPKey, setContextPKey] = useState<string>('');
  const [fixedCostDatas, setFixedCostDatas] = useState<FixedCostDataType>({});
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const setFixedCostData = (docId: string, pKey: string, amount: number, isSubmit: boolean = false) => {
    setFixedCostDatas(prev => ({
      ...prev,
      [pKey]: {
        docId: docId,
        amount: amount
      }
    }));
    setContextPKey(pKey);
    setIsSubmit(isSubmit);
  }

  const getFixedCostData = async (query: Query, dek: CryptoKey): Promise<GetFixedCostDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const dataArray: GetFixedCostDataFromFirestoreType = [];
    await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const decryptedData = await decryptData<FixedCostDataFromFirestoreType>(
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

  const setFixedCostDataFromFirestore = (docId: string, date: Date, data: FixedCostDataFromFirestoreType) => {
    setFixedCostDatas(prev => ({
      ...prev,
      [changePrimaryKey(date, data.Category, PrimaryKeyType.MONTH)]: {
        docId: docId,
        amount: data.Amount
      }
    }));
  }

  const getAndSetFixedCostData = async (query: Query, dek: CryptoKey) => {
    const dataArray = await getFixedCostData(query, dek);
    dataArray.forEach(data => setFixedCostDataFromFirestore(data.docId, data.date, data.decryptedData));
  }

  useEffect(() => {
    const fetchData = async () => {
      const fixedCostData = fixedCostDatas[contextPKey];
      const docId = fixedCostData?.docId;
      const [date, category] = pKeyToDateAndCategory(contextPKey);
      await createAndUpdateFixedCostData(docId, date, category);
    };
    if (contextPKey && isSubmit) {
      fetchData();
    }
  }, [fixedCostDatas, contextPKey, isSubmit]);

  const createAndUpdateFixedCostData = async (docId: string, date: Date, category: string) => {
    const rawFixedCostData: FixedCostDataFromFirestoreType = {
      Amount: fixedCostDatas[contextPKey]?.amount,
      Category: category,
    }

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawFixedCostData, dek);
      if (docId) {
        const docRef = doc(db, 'FixedCosts', docId);
  
        await setDoc(docRef, {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          Date: date,
          UpdatedAt: new Date()
        }, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'FixedCosts'), {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          Date: date,
          CreatedAt: new Date(),
          UpdatedAt: new Date()
        });
        fixedCostDatas[contextPKey].docId = docRef.id;
      }
    }
  }

  return (
    <FixedCostContext.Provider value={{
      fixedCostDatas,
      setFixedCostData,
      getAndSetFixedCostData
    }}>
      {children}
    </FixedCostContext.Provider>
  );
}

export function useFixedCost() {
  const context = useContext(FixedCostContext);
  if (context === undefined) {
    throw new Error('useFixedCost must be used within an FixedCostProvider');
  }
  return context;
} 