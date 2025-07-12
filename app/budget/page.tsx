'use client';

import { useFixedCostCategory } from '@/context/FixedCostCategoryContext';
import { useEffect, useState } from 'react';
import { useExpenseCategory } from '@/context/ExpenseCategoryContext';
import ExpenseBudgetInput from '@/components/BudgetSection/ExpenseBudgetInput';
import { useExpenseBudget } from '@/context/ExpenseBudgetContext';
import { useIncomeCategory } from '@/context/IncomeCategoryContext';
import { useFixedCostBudget } from '@/context/FixedCostBudgetContext';
import FixedCostBudgetInput from '@/components/BudgetSection/FixedCostBudgetInput';
import IncomeBudgetInput from '@/components/BudgetSection/IncomeBudgetInput';
import { useIncomeBudget } from '@/context/IncomeBudgetContext';
import Link from 'next/link';

export default function BudgetPage() {
  const [totalExpenseBudget, setTotalExpenseBudget] = useState<number>(0);
  const [totalFixedCostBudget, setTotalFixedCostBudget] = useState<number>(0);
  const [totalIncomeBudget, setTotalIncomeBudget] = useState<number>(0);
  const { sortedExpenseCategories } = useExpenseCategory();
  const { sortedFixedCostCategories } = useFixedCostCategory();
  const { sortedIncomeCategories } = useIncomeCategory();
  const { expenseBudgetDatas } = useExpenseBudget();
  const { fixedCostBudgetDatas } = useFixedCostBudget();
  const { incomeBudgetDatas } = useIncomeBudget();

  useEffect(() => {
    setTotalExpenseBudget(
      sortedExpenseCategories.reduce((sum, category) => {
        return sum + (expenseBudgetDatas[category]?.amount || 0)
      }, 0)
    );
    setTotalFixedCostBudget(
      sortedFixedCostCategories.reduce((sum, category) => {
        return sum + (fixedCostBudgetDatas[category]?.amount || 0)
      }, 0)
    );
    setTotalIncomeBudget(
      sortedIncomeCategories.reduce((sum, category) => {
        return sum + (incomeBudgetDatas[category]?.amount || 0)
      }, 0)
    );
  }, [expenseBudgetDatas, fixedCostBudgetDatas, incomeBudgetDatas]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6  max-w-[500px] mx-auto m-8 relative">
      <div className="flex items-center relative mb-4">
        <Link href="/" className="cursor-pointer mr-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold">予算</h1>
      </div>
      <div className="fixed z-10 bg-white top-[8%] right-[34%] shadow-md px-4 py-1 rounded-lg">
        <div className="text-xl font-medium">
          収 {totalIncomeBudget} - 支 {totalExpenseBudget + totalFixedCostBudget} = 残 {totalIncomeBudget - (totalExpenseBudget + totalFixedCostBudget)} 
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4">変動費</h2>
      <div className="space-y-4">
        {sortedExpenseCategories.map(category => (
          <ExpenseBudgetInput 
            key={category} 
            pKey={category} 
            category={category} 
          />
        ))}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">合計</span>
            <span className="font-bold">
              ¥{totalExpenseBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4 mt-10">固定費</h2>
      <div className="space-y-4">
        {sortedFixedCostCategories.map(category => (
          <FixedCostBudgetInput
            key={category}
            pKey={category}
            category={category}
          />
        ))}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">合計</span>
            <span className="font-bold">
              ¥{totalFixedCostBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4 mt-10">収入</h2>
      <div className="space-y-4">
        {sortedIncomeCategories.map(category => (
          <IncomeBudgetInput
            key={category}
            pKey={category}
            category={category}
          />
        ))}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">合計</span>
            <span className="font-bold">
              ¥{totalIncomeBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 