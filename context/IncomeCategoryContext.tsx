'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, limit, Query, query, setDoc, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { firstIncomeCategories } from '@/constants/category';
import { IncomeCategoriesDataType, IncomeCategoryDataFromFirestoreType, IncomeCategoryDataType, GetIncomeCategoryDataFromFirestoreType } from '@/types/incomeType';
import { arrayBufferToBase64, decryptData, base64ToArrayBuffer, base64ToUint8Array, encryptData, uint8ArrayToBase64 } from '@/utils/crypto';

interface IncomeCategoryContextType {
  incomeCategories: IncomeCategoryDataType | undefined;
  setIncomeCategory: (categories: IncomeCategoriesDataType) => void;
  sortedIncomeCategories: string[];
  createFirstIncomeCategories: (uid: string) => Promise<void>;
}

const IncomeCategoryContext = createContext<IncomeCategoryContextType | undefined>(undefined);

export function IncomeCategoryProvider({ children }: { children: ReactNode }) {
  const { user, setLoadingState } = useAuth();
  const { dek } = useDek();
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategoryDataType>();
  const [sortedIncomeCategories, setSortedIncomeCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, 'IncomeCategory'),
        where('UserId', '==', user?.uid || ''),
        limit(1)
      );
      if (dek) {
        const categories = await getAndSetIncomeCategoryData(q, dek);
        const sorted = categories.sort((a, b) => a.OrderNo - b.OrderNo).map(x => x.Category);
        setSortedIncomeCategories(sorted);
      }

      setLoadingState(false);
    };
    user && dek && fetchData();
  }, [user, dek]);

  useEffect(() => {
    const fetchData = async () => {
      await updateIncomeCategories();
      if (incomeCategories) {
        const sorted = incomeCategories.categories.sort((a, b) => a.orderNo - b.orderNo).map(x => x.category);
        setSortedIncomeCategories(sorted);
      }
    }
    fetchData();
  }, [incomeCategories]);

  const setIncomeCategory = (categories: IncomeCategoriesDataType) => {
    setIncomeCategories(prev => {
      if (!prev) return prev;
      return {
       ...prev,
       categories: categories,
      };
    });
  }

  const getIncomeCategoryData = async (query: Query, dek: CryptoKey): Promise<GetIncomeCategoryDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const doc = querySnapshot.docs[0];
    const docId = doc.id;
    const data = doc.data();
    const decryptedData = await decryptData<IncomeCategoryDataFromFirestoreType>(
      base64ToArrayBuffer(data.EncryptedData), 
      dek,
      base64ToUint8Array(data.IV)
    );

    return {
      docId: docId,
      decryptedData: decryptedData
    }
  }

  const setIncomeCategoryDataFromFirestore = (docId: string, data: IncomeCategoryDataFromFirestoreType) => {
    setIncomeCategories({
      docId: docId,
      categories: data.map(categoryObj => ({category: categoryObj.Category, orderNo: categoryObj.OrderNo}))
    })
  }

  const getAndSetIncomeCategoryData = async (query: Query, dek: CryptoKey): Promise<IncomeCategoryDataFromFirestoreType> => {
    const data = await getIncomeCategoryData(query, dek);
    setIncomeCategoryDataFromFirestore(data.docId, data.decryptedData);
    return data.decryptedData;
  }

  const createFirstIncomeCategories = async () => {
    const rawIncomeCategories: IncomeCategoryDataFromFirestoreType = firstIncomeCategories.map((category, idx) => (
      {
        Category: category,
        OrderNo: idx + 1
      }
    ));

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawIncomeCategories, dek);

      await addDoc(collection(db, 'IncomeCategory'), {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });
    }
  }
  const updateIncomeCategories = async () => {
    if (dek && user && incomeCategories) {
      const rawIncomeCategories: IncomeCategoryDataFromFirestoreType = incomeCategories.categories.map(categoryObj => (
        {
          Category: categoryObj.category,
          OrderNo: categoryObj.orderNo
        }
      ));
      const docId = incomeCategories.docId;
      const { encrypted, iv } = await encryptData(rawIncomeCategories, dek);

      const docRef = doc(db, 'IncomeCategory', docId);
      await setDoc(docRef, {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        UpdatedAt: new Date()
      }, { merge: true });
    }
  }

  return (
    <IncomeCategoryContext.Provider value={{
      incomeCategories,
      setIncomeCategory,
      sortedIncomeCategories,
      createFirstIncomeCategories
    }}>
      {children}
    </IncomeCategoryContext.Provider>
  );
}

export function useIncomeCategory() {
  const context = useContext(IncomeCategoryContext);
  if (context === undefined) {
    throw new Error('useIncomeCategory must be used within an IncomeCategoryProvider');
  }
  return context;
} 