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
import { MemoDataFromFirestoreType, MemoDataType, GetMemoDataFromFirestoreType } from '@/types/memoType';
import { PrimaryKeyType } from '@/constants/primaryKey';

interface MemoContextType {
  setMemoData: (docId: string, pKey: string, memo: string, isSubmit?: boolean) => void;
  memoDatas: MemoDataType;
  getAndSetMemoData: (query: Query, dek: CryptoKey) => Promise<void>;
}

const MemoContext = createContext<MemoContextType | undefined>(undefined);

export function MemoProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { dek } = useDek();
  const router = useRouter();
  const [contextPKey, setContextPKey] = useState<string>('');
  const [memoDatas, setMemoDatas] = useState<MemoDataType>({});
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const setMemoData = (docId: string, pKey: string, memo: string, isSubmit: boolean = false) => {
    setMemoDatas(prev => ({
      ...prev,
      [pKey]: {
        docId: docId,
        memo: memo
      }
    }));
    setContextPKey(pKey);
    setIsSubmit(isSubmit);
  }

  const getMemoData = async (query: Query, dek: CryptoKey): Promise<GetMemoDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const dataArray: GetMemoDataFromFirestoreType = []; // 型を明示的に指定
    await Promise.all(querySnapshot.docs.map(async (doc) => { // forEachをPromise.allに変更
      const data = doc.data();
      const decryptedData = await decryptData<MemoDataFromFirestoreType>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      console.log(decryptedData);
      const date = data.Date.toDate();
      const docId = doc.id;
      dataArray.push({ docId, date, decryptedData });
    }));
    return dataArray;
  }

  const setMemoDataFromFirestore = (docId: string, date: Date, data: MemoDataFromFirestoreType) => {
    setMemoDatas(prev => ({
      ...prev,
      [changePrimaryKey(date, null, PrimaryKeyType.WITHOUTCATEGORY)]: {
        docId: docId,
        memo: data.Memo
      }
    }));
    console.log(memoDatas);
    console.log('確認',changePrimaryKey(date, null, PrimaryKeyType.WITHOUTCATEGORY));
  }

  const getAndSetMemoData = async (query: Query, dek: CryptoKey) => {
    const dataArray = await getMemoData(query, dek);
    dataArray.forEach(data => setMemoDataFromFirestore(data.docId, data.date, data.decryptedData));
  }

  useEffect(() => {
    const fetchData = async () => {
      const memoData = memoDatas[contextPKey];
      const docId = memoData?.docId;
      const [date] = pKeyToDateAndCategory(contextPKey);
      await createAndUpdateMemoData(docId, date);
    };
    if (contextPKey && isSubmit) {
      fetchData();
    }
  }, [memoDatas, contextPKey, isSubmit]);

  const createAndUpdateMemoData = async (docId: string, date: Date) => {
    const rawMemoData: MemoDataFromFirestoreType = {
      Memo: memoDatas[contextPKey]?.memo,
    }

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawMemoData, dek);
      if (docId) {
        const docRef = doc(db, 'Memos', docId);
  
        await setDoc(docRef, {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          Date: date,
          UpdatedAt: new Date()
        }, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'Memos'), {
          UserId: user.uid,
          IV: uint8ArrayToBase64(iv),
          EncryptedData: arrayBufferToBase64(encrypted),
          Date: date,
          CreatedAt: new Date(),
          UpdatedAt: new Date()
        });
        memoDatas[contextPKey].docId = docRef.id;
      }
    }
  }

  return (
    <MemoContext.Provider value={{
      memoDatas,
      setMemoData,
      getAndSetMemoData
    }}>
      {children}
    </MemoContext.Provider>
  );
}

export function useExpenseMemo() {
  const context = useContext(MemoContext);
  if (context === undefined) {
    throw new Error('useMemo must be used within an MemoProvider');
  }
  return context;
} 