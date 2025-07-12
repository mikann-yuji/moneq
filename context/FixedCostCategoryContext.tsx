'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, limit, Query, query, setDoc, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { firstFixedCostCategories } from '@/constants/category';
import { FixedCostCategoriesDataType, FixedCostCategoryDataFromFirestoreType, FixedCostCategoryDataType, GetFixedCostCategoryDataFromFirestoreType } from '@/types/fixedCostType';
import { arrayBufferToBase64, decryptData, base64ToArrayBuffer, base64ToUint8Array, encryptData, uint8ArrayToBase64 } from '@/utils/crypto';

interface FixedCostCategoryContextType {
  fixedCostCategories: FixedCostCategoryDataType | undefined;
  setFixedCostCategory: (categories: FixedCostCategoriesDataType) => void;
  sortedFixedCostCategories: string[];
  createFirstFixedCostCategories: (uid: string) => Promise<void>;
}

const FixedCostCategoryContext = createContext<FixedCostCategoryContextType | undefined>(undefined);

export function FixedCostCategoryProvider({ children }: { children: ReactNode }) {
  const { user, setLoadingState } = useAuth();
  const { dek } = useDek();
  const [fixedCostCategories, setFixedCostCategories] = useState<FixedCostCategoryDataType>();
  const [sortedFixedCostCategories, setSortedFixedCostCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, 'FixedCostCategory'),
        where('UserId', '==', user?.uid || ''),
        limit(1)
      );
      if (dek) {
        const categories = await getAndSetFixedCostCategoryData(q, dek);
        const sorted = categories.sort((a, b) => a.OrderNo - b.OrderNo).map(x => x.Category);
        setSortedFixedCostCategories(sorted);
      }

      setLoadingState(false);
    };
    user && dek && fetchData();
  }, [user, dek]);

  useEffect(() => {
    const fetchData = async () => {
      await updateFixedCostCategories();
      if (fixedCostCategories) {
        const sorted = fixedCostCategories.categories.sort((a, b) => a.orderNo - b.orderNo).map(x => x.category);
        setSortedFixedCostCategories(sorted);
      }
    }
    fetchData();
  }, [fixedCostCategories]);

  const setFixedCostCategory = (categories: FixedCostCategoriesDataType) => {
    setFixedCostCategories(prev => {
      if (!prev) return prev;
      return {
       ...prev,
       categories: categories,
      };
    });
  }

  const getFixedCostCategoryData = async (query: Query, dek: CryptoKey): Promise<GetFixedCostCategoryDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const doc = querySnapshot.docs[0];
    const docId = doc.id;
    const data = doc.data();
    const decryptedData = await decryptData<FixedCostCategoryDataFromFirestoreType>(
      base64ToArrayBuffer(data.EncryptedData), 
      dek,
      base64ToUint8Array(data.IV)
    );

    return {
      docId: docId,
      decryptedData: decryptedData
    }
  }

  const setFixedCostCategoryDataFromFirestore = (docId: string, data: FixedCostCategoryDataFromFirestoreType) => {
    setFixedCostCategories({
      docId: docId,
      categories: data.map(categoryObj => ({category: categoryObj.Category, orderNo: categoryObj.OrderNo}))
    })
  }

  const getAndSetFixedCostCategoryData = async (query: Query, dek: CryptoKey): Promise<FixedCostCategoryDataFromFirestoreType> => {
    const data = await getFixedCostCategoryData(query, dek);
    setFixedCostCategoryDataFromFirestore(data.docId, data.decryptedData);
    return data.decryptedData;
  }

  const createFirstFixedCostCategories = async (uid: string) => {
    const rawFixedCostCategories: FixedCostCategoryDataFromFirestoreType = firstFixedCostCategories.map((category, idx) => (
      {
        Category: category,
        OrderNo: idx + 1
      }
    ));

    if (dek && user) {
      const { encrypted, iv } = await encryptData(rawFixedCostCategories, dek);

      await addDoc(collection(db, 'FixedCostCategory'), {
        UserId: uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });
    }
  }
  const updateFixedCostCategories = async () => {
    if (dek && user && fixedCostCategories) {
      const rawFixedCostCategories: FixedCostCategoryDataFromFirestoreType = fixedCostCategories.categories.map(categoryObj => (
        {
          Category: categoryObj.category,
          OrderNo: categoryObj.orderNo
        }
      ));
      const docId = fixedCostCategories.docId;
      const { encrypted, iv } = await encryptData(rawFixedCostCategories, dek);

      const docRef = doc(db, 'FixedCostCategory', docId);
      await setDoc(docRef, {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        UpdatedAt: new Date()
      }, { merge: true });
    }
  }

  return (
    <FixedCostCategoryContext.Provider value={{
      fixedCostCategories,
      setFixedCostCategory,
      sortedFixedCostCategories,
      createFirstFixedCostCategories
    }}>
      {children}
    </FixedCostCategoryContext.Provider>
  );
}

export function useFixedCostCategory() {
  const context = useContext(FixedCostCategoryContext);
  if (context === undefined) {
    throw new Error('useFixedCostCategory must be used within an FixedCostCategoryProvider');
  }
  return context;
} 