'use client';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useExpense } from '@/context/ExpenseContext';
import ExpenseMenu from '@/components/Menu/ExpenseMenu';
import { inputStyle } from '@/styles/inputStyles';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useRouter } from 'next/navigation';
import { encryptData, decryptData, uint8ArrayToBase64, arrayBufferToBase64 } from '@/utils/crypto';
import { DetailsFromFirestoreType, ExpenseDataFromFirestoreType } from '@/types/expenseType';
import { useEffect } from 'react';
import { useExpenseMemo } from '@/context/MemoContext';

interface MemoInputProps {
  pKey: string;
}

export default function MemoInput({ 
  pKey
}: MemoInputProps) {
  const { setMemoData, memoDatas } = useExpenseMemo();

  const handleChange = (value: string) => {
    const memoData = memoDatas[pKey]
    const memo = value || '';
    const docId = memoData?.docId || '';
    setMemoData(docId, pKey, memo);
  };

  const handleBlur = async (value: string) => {
    const memoData = memoDatas[pKey]
    const memo = value || '';
    const docId = memoData?.docId || '';

    setMemoData(docId, pKey, memo, true);
  };

  useEffect(() => console.log(memoDatas), [memoDatas])

  return (
    <input
      key={pKey}
      type='text'
      className={`${inputStyle} w-30`}
      placeholder='メモ'
      value={memoDatas[pKey]?.memo || ''}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={(e) => handleBlur(e.target.value)}
    />
  );
} 