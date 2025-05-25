'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import useSWR from 'swr';

interface ExpenseContextType {
  updateAmount: (docId: string, amount: number) => Promise<void>;
  getAmount: (docId: string) => Promise<number>;
  amounts: { [key: string]: number };
  setAmount: (docId: string, amount: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const fetcher = async (docId: string) => {
  const docRef = doc(db, 'Expenses', docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().Amount || 0 : 0;
};

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const updateAmount = async (docId: string, amount: number) => {
    const docRef = doc(db, 'Expenses', docId);
    await setDoc(docRef, {
      Amount: amount,
      UpdatedAt: new Date()
    }, { merge: true });
    setAmounts(prev => ({ ...prev, [docId]: amount }));
  };

  const getAmount = async (docId: string) => {
    const { data } = useSWR(docId, fetcher);
    if (data !== undefined) {
      setAmounts(prev => ({ ...prev, [docId]: data }));
    }
    return data || 0;
  };

  const setAmount = (docId: string, amount: number) => {
    setAmounts(prev => ({ ...prev, [docId]: amount }));
  };

  return (
    <ExpenseContext.Provider value={{
      updateAmount,
      getAmount,
      amounts,
      setAmount,
      selectedYear,
      setSelectedYear,
      selectedMonth,
      setSelectedMonth,
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