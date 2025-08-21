'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CollectionNames } from '@/localDB/type';
import BudgetInput from './components/BudgetInput';
import { useLocalDBStore } from '@/localDB/store';
import { useSortCategory } from '@/hooks/useSortCategory';
import { motion } from 'framer-motion';

export default function BudgetPage() {
  const [totalExpenseBudget, setTotalExpenseBudget] = useState<number>(0);
  const [totalFixedCostBudget, setTotalFixedCostBudget] = useState<number>(0);
  const [totalIncomeBudget, setTotalIncomeBudget] = useState<number>(0);

  const sortedExpenseCategories = useSortCategory(CollectionNames.ExpenseCategory);
  const sortedFixedCostCategories = useSortCategory(CollectionNames.FixedCostCategory);
  const sortedIncomeCategories = useSortCategory(CollectionNames.IncomeCategory);
  const expenseBudgets = useLocalDBStore(state => state.collections[CollectionNames.ExpenseBudgets]);
  const fixedCostBudgets = useLocalDBStore(state => state.collections[CollectionNames.FixedCostBudgets]);
  const incomeBudgets = useLocalDBStore(state => state.collections[CollectionNames.IncomeBudgets]);

  useEffect(() => {
    setTotalExpenseBudget(
      sortedExpenseCategories.reduce((sum, category) => {
        return sum + (
          expenseBudgets.find(item => item.PlainText.Category == category)?.PlainText.Amount || 0
        )
      }, 0)
    );
    setTotalFixedCostBudget(
      sortedFixedCostCategories.reduce((sum, category) => {
        return sum + (
          fixedCostBudgets.find(item => item.PlainText.Category == category)?.PlainText.Amount || 0
        )
      }, 0)
    );
    setTotalIncomeBudget(
      sortedIncomeCategories.reduce((sum, category) => {
        return sum + (
          incomeBudgets.find(item => item.PlainText.Category == category)?.PlainText.Amount || 0
        )
      }, 0)
    );
  }, [
    expenseBudgets, 
    fixedCostBudgets, 
    incomeBudgets,
    sortedExpenseCategories,
    sortedFixedCostCategories,
    sortedIncomeCategories
  ]);

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
      <motion.div drag dragMomentum={false} className="fixed z-10 bg-white top-[8%] right-[34%] shadow-md px-4 py-1 rounded-lg cursor-move">
        <div className="text-xl font-medium">
          収 {totalIncomeBudget} - 支 {totalExpenseBudget + totalFixedCostBudget} = 残 {totalIncomeBudget - (totalExpenseBudget + totalFixedCostBudget)} 
        </div>
      </motion.div>
      <h2 className="text-lg font-semibold mb-4">変動費</h2>
      <div className="space-y-4">
        {sortedExpenseCategories.map(category => (
          <BudgetInput 
            key={category}
            collectionName={CollectionNames.ExpenseBudgets}
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
          <BudgetInput 
            key={category}
            collectionName={CollectionNames.FixedCostBudgets}
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
          <BudgetInput 
            key={category}
            collectionName={CollectionNames.IncomeBudgets}
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