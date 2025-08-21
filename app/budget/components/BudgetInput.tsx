'use client';

import { useAuth } from '@/features/auth/hooks';
import { useLocalDB } from '@/localDB/hooks';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionMap, CollectionNames } from '@/localDB/type';
import { inputStyle } from '@/styles/inputStyles';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

type BudgetInputProps<
  K extends CollectionNames.ExpenseBudgets
  | CollectionNames.FixedCostBudgets 
  | CollectionNames.IncomeBudgets
> = {
  collectionName: K;
  category: string;
};

export default function BudgetInput<
  K extends CollectionNames.ExpenseBudgets
  | CollectionNames.FixedCostBudgets 
  | CollectionNames.IncomeBudgets
>({
  collectionName,
  category,
}: BudgetInputProps<K>) {
  const { putCollection, createDataWithIDByBudget } = useLocalDB();
  const { user, dek } = useAuth();
  const router = useRouter();

  const originalAmountRef = useRef<number | null>(null);
  const budgetData = useLocalDBStore(state => state.collections[collectionName].find(item => (
    item.PlainText.Category === category)));

  const handleChange = (value: string) => {
    const amount = value ? parseInt(value) : 0;

    if (dek && user) {
      if (budgetData) {
        const updateData = {
          ...budgetData,
          PlainText: {
            ...budgetData.PlainText,
            Amount: amount
          },
          Synced: false,
        }
        putCollection(collectionName, updateData, dek, user);
      } else {
        const createData = createDataWithIDByBudget(
          collectionName,
          {
            PlainText: {
              Amount: amount,
              Category: category,
            },
            Synced: false,
          } as Omit<CollectionMap[typeof collectionName], 'id'>
        );
        putCollection(collectionName, createData, dek, user);
      }
    } else {
      router.push("/signin");
    }
  };

  const handleBlur = async (value: string) => {
    const amount = value ? parseInt(value) : 0;
    if (originalAmountRef.current !== null
      && originalAmountRef.current === amount) return;

    if (dek && user) {
      if (budgetData) {
        const updateData = {
          ...budgetData,
          PlainText: {
            ...budgetData.PlainText,
            Amount: amount
          },
          Synced: false,
        }
        putCollection(collectionName, updateData, dek, user, true);
      }
    } else {
      router.push("/signin");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
      <input
        type="number"
        className={inputStyle}
        placeholder="¥"
        value={(budgetData?.PlainText.Amount || '').toString()}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => originalAmountRef.current = budgetData?.PlainText.Amount ?? 0}
        onBlur={(e) => handleBlur(e.target.value)}
      />
    </div>
  );
} 