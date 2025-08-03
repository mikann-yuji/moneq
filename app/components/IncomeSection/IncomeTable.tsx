'use client';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useExpense } from '@/context/ExpenseContext';
import { useIncome } from '@/context/IncomeContext';
import { useIncomeCategory } from '@/context/IncomeCategoryContext';
import { db } from '@/lib/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import IncomeInput from './IncomeInput';
import { changePrimaryKey } from '@/utils/changePrimaryKey';
import { PrimaryKeyType } from '@/constants/primaryKey';
import { useIncomeBudget } from '@/context/IncomeBudgetContext';

export default function IncomeSection() {
  const { selectedYear, selectedMonth } = useExpense();
  const { sortedIncomeCategories } = useIncomeCategory();
  const { incomeBudgetDatas } = useIncomeBudget();
  const { getAndSetIncomeData, incomeDatas } = useIncome();
  const { dek } = useDek();
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  
  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);

      const q = query(
        collection(db, 'Incomes'),
        where('Date', '>=', startDate),
        where('Date', '<=', endDate),
        where('UserId', '==', user?.uid || '')
      );

      if (dek) {
        getAndSetIncomeData(q, dek);
      }
    }

    fetchData();
  }, [selectedYear, selectedMonth, dek])

  useEffect(() => {
    const tmpTotal = sortedIncomeCategories.reduce((sum, category) => {
      const tmpPKey = changePrimaryKey(new Date(selectedYear, selectedMonth - 1), category, PrimaryKeyType.MONTH);
      return sum + (incomeDatas[tmpPKey]?.amount || 0)
    }, 0);
    setTotal(tmpTotal);
  }, [incomeDatas]);

  useEffect(() => {
    setTotalBudget(
      sortedIncomeCategories.reduce((sum, category) => {
        return sum + (incomeBudgetDatas[category]?.amount || 0)
      }, 0)
    );
  }, [incomeBudgetDatas]);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow h-fit">
      <h2 className="text-lg font-semibold mb-4">収入</h2>
      <div className="space-y-4">
        {sortedIncomeCategories.map(category => (
          <IncomeInput
            key={category}
            category={category}
            pKey={changePrimaryKey(new Date(selectedYear, selectedMonth - 1), category, PrimaryKeyType.MONTH)}
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