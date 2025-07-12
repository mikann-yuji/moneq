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
import MemoInput from './MemoInput';

interface ExpenseInputProps {
  isMemo: boolean;
  dayIndex: number;
  catIndex: number;
  totalDays: number;
  totalCategories: number;
  pKey: string;
}

export default function ExpenseInput({ 
  isMemo,
  dayIndex,
  catIndex,
  totalDays,
  totalCategories,
  pKey
}: ExpenseInputProps) {
  const { expenseDatas, setExpenseData } = useExpense();
  const { user } = useAuth();
  const { dek } = useDek();
  const router = useRouter();

  const handleChange = (value: string) => {
    const expenseData = expenseDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = expenseData?.docId || '';
    setExpenseData(docId, pKey, amount);
  };

  const handleBlur = async (value: string) => {
    const expenseData = expenseDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = expenseData?.docId;

    setExpenseData(docId, pKey, amount);
  };

  return (
    <td className={
      `p-1 bg-white 
      ${dayIndex === 0 && catIndex === 0 ? 'rounded-tl' : ''} 
      ${dayIndex === 0 && catIndex === totalCategories - 1 ? 'rounded-tr' : ''} 
      ${dayIndex === totalDays - 1 && catIndex === 0 ? 'rounded-bl' : ''} 
      ${dayIndex === totalDays - 1 && catIndex === totalCategories - 1 ? 'rounded-br' : ''}`
    }>
      <div className="relative">
        {
          isMemo 
            ? <MemoInput pKey={pKey.split('_')[0]} />
            : (
              <>
                <input
                  type='number'
                  className={`${inputStyle} w-30`}
                  placeholder='¥'
                  value={(expenseDatas[pKey]?.amount || '').toString()}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={(e) => handleBlur(e.target.value)}
                />
                {expenseDatas[pKey]?.amount != 0 && expenseDatas[pKey]?.amount != undefined && (
                  <ExpenseMenu
                    currentAmount={expenseDatas[pKey].amount || 0}
                    pKey={pKey}
                  />
                )}
              </>
            )
        }
      </div>
    </td>
  );
} 