'use client';

import ExpenseMenu from '@/app/components/Menu/ExpenseMenu';
import { useAuth } from '@/features/auth/hooks';
import { useCom } from '@/features/com/hooks';
import { useLocalDB } from '@/localDB/hooks';
import { Expense } from '@/localDB/model/expense';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionNames } from '@/localDB/type';
import { inputStyle } from '@/styles/inputStyles';
import MemoInput from './MemoInput';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

interface ExpenseInputProps {
  isMemo: boolean;
  day: number;
  category: string;
}

export default function ExpenseInput({ 
  isMemo,
  day,
  category,
}: ExpenseInputProps) {
  const { putCollection, createDataWithID } = useLocalDB();
  const { createDateWithDay } = useCom();
  const { user, dek } = useAuth();

  const router = useRouter();
  const originalAmountRef = useRef<number | null>(null);
  const date = createDateWithDay(day);
  const expenseData = useLocalDBStore(state => state.collections[CollectionNames.Expenses].find(item => (
    item.PlainText.Category === category && item.Date.getTime() === date.getTime()
  )));

  const handleChange = (value: string) => {
    const amount = value ? parseInt(value) : 0;

    if (dek && user) {
      if (expenseData) {
        const updateData: Expense = {
          ...expenseData,
          PlainText: {
            ...expenseData.PlainText,
            Amount: amount,
          },
          Synced: false,
        }
        putCollection(CollectionNames.Expenses, updateData, dek, user);
      } else {
        const createData = createDataWithID(
          CollectionNames.Expenses,
          {
            PlainText: {
              Amount: amount,
              Category: category,
            },
            Date: date,
            Synced: false,
          }
        );
        putCollection(CollectionNames.Expenses, createData, dek, user);
      }
    } else {
      router.push("/signin")
    }
  };

  const handleBlur = (value: string) => {
    const amount = value ? parseInt(value) : 0;
    if (originalAmountRef.current !== null 
      && originalAmountRef.current === amount) return;

    if (dek && user) {
      if (expenseData) {
        const updateData: Expense = {
          ...expenseData,
          PlainText: {
            ...expenseData.PlainText,
            Amount: amount,
          },
          Synced: false,
        }
        putCollection(CollectionNames.Expenses, updateData, dek, user, true);
      }
    } else {
      router.push("/signin")
    }
  };

  return (
    <td className="p-1 bg-white">
      <div className="relative">
        {
          isMemo 
            ? <MemoInput day={day} />
            : (
              <>
                <input
                  type='number'
                  className={`${inputStyle} w-30`}
                  placeholder='¥'
                  value={(expenseData?.PlainText.Amount || '').toString()}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => originalAmountRef.current = expenseData?.PlainText.Amount ?? 0}
                  onBlur={(e) => { 
                    handleBlur(e.target.value); 
                    originalAmountRef.current = null; 
                  }}
                />
                {expenseData?.PlainText.Amount != 0 && expenseData?.PlainText.Amount != undefined && (
                  <ExpenseMenu
                    currentAmount={expenseData.PlainText.Amount || 0}
                    day={day}
                    category={category}
                  />
                )}
              </>
            )
        }
      </div>
    </td>
  );
} 