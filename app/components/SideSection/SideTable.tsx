'use client';

import { useAuth } from '@/features/auth/hooks';
import { useCom } from '@/features/com/hooks';
import { firestore } from '@/lib/firebase';
import { useLocalDB } from '@/localDB/hooks';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionNames } from '@/localDB/type';
import { collection, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import SideTableInput from './SideTableInput';
import { useSortCategory } from '@/hooks/useSortCategory';

type SideTableProps<
  K extends CollectionNames.FixedCosts
  | CollectionNames.Incomes,
  C extends CollectionNames.FixedCostCategory
  | CollectionNames.IncomeCategory,
  B extends CollectionNames.FixedCostBudgets
  | CollectionNames.IncomeBudgets
> = {
  title: string;
  collectionName: K;
  collectionCategoryName: C;
  collectionBudgetName: B;
}

export default function SideTable<
  K extends CollectionNames.FixedCosts
  | CollectionNames.Incomes,
  C extends CollectionNames.FixedCostCategory
  | CollectionNames.IncomeCategory,
  B extends CollectionNames.FixedCostBudgets
  | CollectionNames.IncomeBudgets
>({
  title,
  collectionName,
  collectionCategoryName,
  collectionBudgetName
}: SideTableProps<K, C, B>) {
  const [total, setTotal] = useState(0);
  const [totalBudget, setTotalBudget] = useState<number>(0);

  const { selectedYear, selectedMonth, createDateWithoutDay } = useCom();
  const { dek, user } = useAuth();
  const { syncFromFirestore } = useLocalDB();
  
  const amountCollection = useLocalDBStore(state => state.collections[collectionName]);
  const budgetCollection = useLocalDBStore(state => state.collections[collectionBudgetName]);
  const sortedCategories = useSortCategory(collectionCategoryName);

  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);

      if (dek && user) {
        const q = query(
          collection(firestore, 'Incomes'),
          where('Date', '>=', startDate),
          where('Date', '<=', endDate),
          where('UserId', '==', user.uid)
        );

        syncFromFirestore(q, dek, CollectionNames.Incomes);
      }
    }

    fetchData();
  }, [selectedYear, selectedMonth, dek, user])

  useEffect(() => {
    const tmpTotal = sortedCategories.reduce((sum, category) => {
      return sum + (
        amountCollection.find(item => (
          item.Date.getTime() === createDateWithoutDay().getTime() && item.PlainText.Category === category
        ))?.PlainText.Amount || 0
      )
    }, 0);
    setTotal(tmpTotal);
  }, [amountCollection, sortedCategories]);

  useEffect(() => {
    setTotalBudget(
      sortedCategories.reduce((sum, category) => {
        return sum + (
          budgetCollection.find(item => (
            item.PlainText.Category === category
          ))?.PlainText.Amount || 0
        )
      }, 0)
    );
  }, [budgetCollection, sortedCategories]);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow h-fit">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {sortedCategories.map(category => (
          <SideTableInput
            key={category}
            collectionName={collectionName}
            category={category}
          />
        ))}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">合計</span>
            <span className="font-bold">
              ¥{total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">予算</span>
            <span className="font-bold">
              ¥{totalBudget.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">残</span>
            <span className="font-bold">
              ¥{(totalBudget - total).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 