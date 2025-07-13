'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, limit, Query, query, setDoc, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { firstExpenseCategories } from '@/constants/category';
import { ExpenseCategoriesDataType, ExpenseCategoryDataFromFirestoreType, ExpenseCategoryDataType, GetExpenseCategoryDataFromFirestoreType } from '@/types/expenseType';
import { arrayBufferToBase64, decryptData, base64ToArrayBuffer, base64ToUint8Array, encryptData, uint8ArrayToBase64 } from '@/utils/crypto';

interface ExpenseCategoryContextType {
  expenseCategories: ExpenseCategoryDataType | undefined;
  setExpenseCategory: (categories: ExpenseCategoriesDataType) => void;
  sortedExpenseCategories: string[];
  createFirstExpenseCategories: (uid: string, dek: CryptoKey) => Promise<void>;
}

const ExpenseCategoryContext = createContext<ExpenseCategoryContextType | undefined>(undefined);

export function ExpenseCategoryProvider({ children }: { children: ReactNode }) {
  const { user, setLoadingState } = useAuth();
  const { dek } = useDek();
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryDataType>();
  const [sortedExpenseCategories, setSortedExpenseCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, 'ExpenseCategory'),
        where('UserId', '==', user?.uid || ''),
        limit(1)
      );
      if (dek) {
        const categories = await getAndSetExpenseCategoryData(q, dek);
        const sorted = categories.sort((a, b) => a.OrderNo - b.OrderNo).map(x => x.Category);
        setSortedExpenseCategories(sorted);
      }

      setLoadingState(false);
    };
    user && dek && fetchData();
  }, [user, dek]);

  useEffect(() => {
    const fetchData = async () => {
      await updateExpenseCategories();
      if (expenseCategories) {
        const sorted = expenseCategories.categories.sort((a, b) => a.orderNo - b.orderNo).map(x => x.category);
        setSortedExpenseCategories(sorted);
      }
    }
    fetchData();
  }, [expenseCategories]);

  const setExpenseCategory = (categories: ExpenseCategoriesDataType) => {
    setExpenseCategories(prev => {
      if (!prev) return prev;
      return {
       ...prev,
       categories: categories,
      };
    });
  }

  const getExpenseCategoryData = async (query: Query, dek: CryptoKey): Promise<GetExpenseCategoryDataFromFirestoreType> => {
    const querySnapshot = await getDocs(query);
    const doc = querySnapshot.docs[0];
    const docId = doc.id;
    const data = doc.data();
    const decryptedData = await decryptData<ExpenseCategoryDataFromFirestoreType>(
      base64ToArrayBuffer(data.EncryptedData), 
      dek,
      base64ToUint8Array(data.IV)
    );

    return {
      docId: docId,
      decryptedData: decryptedData
    }
  }

  const setExpenseCategoryDataFromFirestore = (docId: string, data: ExpenseCategoryDataFromFirestoreType) => {
    setExpenseCategories({
      docId: docId,
      categories: data.map(categoryObj => ({category: categoryObj.Category, orderNo: categoryObj.OrderNo}))
    })
  }

  const getAndSetExpenseCategoryData = async (query: Query, dek: CryptoKey): Promise<ExpenseCategoryDataFromFirestoreType> => {
    const data = await getExpenseCategoryData(query, dek);
    setExpenseCategoryDataFromFirestore(data.docId, data.decryptedData);
    return data.decryptedData;
  }

  const createFirstExpenseCategories = async (uid: string, dek: CryptoKey) => {
    const rawExpenseCategories: ExpenseCategoryDataFromFirestoreType = firstExpenseCategories.map((category, idx) => (
      {
        Category: category,
        OrderNo: idx + 1
      }
    ));

    if (user) {
      const { encrypted, iv } = await encryptData(rawExpenseCategories, dek);

      await addDoc(collection(db, 'ExpenseCategory'), {
        UserId: uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });
    }
  }

  const updateExpenseCategories = async () => {
    if (dek && user && expenseCategories) {
      const rawExpenseCategories: ExpenseCategoryDataFromFirestoreType = expenseCategories.categories.map(categoryObj => (
        {
          Category: categoryObj.category,
          OrderNo: categoryObj.orderNo
        }
      ));
      const docId = expenseCategories.docId;
      const { encrypted, iv } = await encryptData(rawExpenseCategories, dek);

      const docRef = doc(db, 'ExpenseCategory', docId);
      await setDoc(docRef, {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        UpdatedAt: new Date()
      }, { merge: true });
    }
  }

  return (
    <ExpenseCategoryContext.Provider value={{
      expenseCategories,
      setExpenseCategory,
      sortedExpenseCategories,
      createFirstExpenseCategories
    }}>
      {children}
    </ExpenseCategoryContext.Provider>
  );
}

export function useExpenseCategory() {
  const context = useContext(ExpenseCategoryContext);
  if (context === undefined) {
    throw new Error('useExpenseCategory must be used within an ExpenseCategoryProvider');
  }
  return context;
} 