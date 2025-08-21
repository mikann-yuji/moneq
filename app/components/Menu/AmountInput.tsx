'use client';

import { useRef, useEffect } from 'react';
import { Mode } from '@/constants/modes';
import { useLocalDB } from '@/localDB/hooks';
import { CollectionNames } from '@/localDB/type';
import { useCom } from '@/features/com/hooks';
import { useAuth } from '@/features/auth/hooks';
import { Expense } from '@/localDB/model/expense';
import { useLocalDBStore } from '@/localDB/store';
import { useRouter } from 'next/navigation';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  currentAmount: number;
  mode: Mode | null;
  category: string;
  day: number;
}

export default function AmountInput({ value, onChange, onClose, currentAmount, mode, category, day }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { putCollection, createDataWithID } = useLocalDB();
  const { createDateWithDay } = useCom();
  const { dek, user } = useAuth();

  const router = useRouter();
  const date = createDateWithDay(day);
  const expenseData = useLocalDBStore(state => state.collections[CollectionNames.Expenses].find(item => (
    item.PlainText.Category === category && item.Date.getTime() === createDateWithDay(day).getTime()
  )));

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    const newAmount = parseInt(value) || 0;
    let totalAmount = currentAmount;

    if (mode === Mode.ADD) {
      totalAmount += newAmount;
    } else if (mode === Mode.SUBTRACT) {
      totalAmount -= newAmount;
    }
    console.log(totalAmount);
    
    if (dek && user) {
      if (expenseData) {
        const updateData: Expense = {
          ...expenseData,
          PlainText: {
            ...expenseData.PlainText,
            Amount: totalAmount,
          },
          Synced: false,
        }
        putCollection(CollectionNames.Expenses, updateData, dek, user, true);
      } else {
        const createData = createDataWithID(
          CollectionNames.Expenses,
          {
            PlainText: {
              Amount: totalAmount,
              Category: category,
            },
            Date: date,
            Synced: false,
          }
        );
        putCollection(CollectionNames.Expenses, createData, dek, user, true);
      }
    } else {
      router.push("/signin");
    }
    onClose();
  };

  return (
    <div className="p-2">
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 border rounded"
        placeholder="金額を入力"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          OK
        </button>
      </div>
    </div>
  );
} 