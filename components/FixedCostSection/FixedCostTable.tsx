'use client';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useExpense } from '@/context/ExpenseContext';
import { useFixedCostCategory } from '@/context/FixedCostCategoryContext';
import { useFixedCost } from '@/context/FixedCostContext';
import { db } from '@/lib/firebase';
import { inputStyle } from '@/styles/inputStyles';
import { collection, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import FixedCostInput from './FixedCostInput';
import { changePrimaryKey } from '@/utils/changePrimaryKey';
import { PrimaryKeyType } from '@/constants/primaryKey';
import { useFixedCostBudget } from '@/context/FixedCostBudgetContext';

export default function IncomeSection() {
  const { selectedYear, selectedMonth } = useExpense();
  const { sortedFixedCostCategories } = useFixedCostCategory();
  const { fixedCostBudgetDatas } = useFixedCostBudget();
  const { getAndSetFixedCostData, fixedCostDatas } = useFixedCost();
  const { dek } = useDek();
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [totalBudget, setTotalBudget] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);

      const q = query(
        collection(db, 'FixedCosts'),
        where('Date', '>=', startDate),
        where('Date', '<=', endDate),
        where('UserId', '==', user?.uid || '')
      );

      if (dek) {
        getAndSetFixedCostData(q, dek);
      }
    }

    fetchData();
  }, [selectedYear, selectedMonth, dek]);

  useEffect(() => {
    const tmpTotal = sortedFixedCostCategories.reduce((sum, category) => {
      const tmpPKey = changePrimaryKey(new Date(selectedYear, selectedMonth - 1), category, PrimaryKeyType.MONTH);
      return sum + (fixedCostDatas[tmpPKey]?.amount || 0)
    }, 0);
    setTotal(tmpTotal);
  }, [fixedCostDatas]);

  useEffect(() => {
    setTotalBudget(
      sortedFixedCostCategories.reduce((sum, category) => {
        return sum + (fixedCostBudgetDatas[category]?.amount || 0)
      }, 0)
    );
  }, [fixedCostBudgetDatas]);

  return (
    <div className="bg-white rounded-lg p-4 shadow h-fit">
      <h2 className="text-lg font-semibold mb-4">固定費</h2>
      <div className="space-y-4">
        {sortedFixedCostCategories.map(category => (
          <FixedCostInput
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