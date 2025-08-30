'use client';

import { useCom } from '@/features/com/hooks';
import { useSortCategory } from '@/hooks/useSortCategory';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionMap, CollectionNames } from '@/localDB/type';
import { inputStyle } from '@/styles/inputStyles';
import { useEffect, useState } from 'react';

const useChangeBudgetCollection = (
  categoryCollection: string[], 
  budgetCollection: CollectionMap[CollectionNames.ExpenseBudgets][]
    | CollectionMap[CollectionNames.FixedCostBudgets][]
    | CollectionMap[CollectionNames.IncomeBudgets][],
  collectionName: string,
  callback: (updater: (prev: Record<string, number>) => Record<string, number>) => void
) => {
  useEffect(() => {
    const tmpTotal = categoryCollection.reduce((sum, category) => {
      return sum + (
        budgetCollection.find(item => (
          item.PlainText.Category === category
        ))?.PlainText.Amount || 0
      )
    }, 0);
    callback(prev => ({ ...prev, [collectionName]: tmpTotal }))
  }, [budgetCollection, categoryCollection]);
}

export default function SideTotalTable() {
  const [total, setTotal] = useState<Record<string, number>>({
    [CollectionNames.Expenses]: 0,
    [CollectionNames.FixedCosts]: 0,
    [CollectionNames.Incomes]: 0
  });
  const [totalBudget, setTotalBudget] = useState<Record<string, number>>({
    [CollectionNames.ExpenseBudgets]: 0,
    [CollectionNames.FixedCostBudgets]: 0,
    [CollectionNames.IncomeBudgets]: 0
  });

  const { createDateWithDay, createDateWithoutDay, selectedYear, selectedMonth } = useCom();

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const expenseCollection = useLocalDBStore(state => state.collections[CollectionNames.Expenses]);
  const fixedCostCollection = useLocalDBStore(state => state.collections[CollectionNames.FixedCosts]);
  const incomeCollection = useLocalDBStore(state => state.collections[CollectionNames.Incomes]);
  const expenseBudgetCollection = useLocalDBStore(state => state.collections[CollectionNames.ExpenseBudgets]);
  const fixedCostBudgetCollection = useLocalDBStore(state => state.collections[CollectionNames.FixedCostBudgets]);
  const incomeBudgetCollection = useLocalDBStore(state => state.collections[CollectionNames.IncomeBudgets]);
  const expenseCategoryCollection = useSortCategory(CollectionNames.ExpenseCategory);
  const fixedCostCategoryCollection = useSortCategory(CollectionNames.FixedCostCategory);
  const incomeCategoryCollection = useSortCategory(CollectionNames.IncomeCategory);

  useEffect(() => {
    let tmpTotal = 0;
    days.forEach((day) => {
      tmpTotal += expenseCategoryCollection.reduce((sum, category) => {
        return sum + (
          expenseCollection.find(item => (
            item.Date.getTime() === createDateWithDay(day).getTime() 
              && item.PlainText.Category === category
          ))?.PlainText.Amount || 0
        )
      }, 0);
    });
    setTotal(prev => ({ ...prev, [CollectionNames.Expenses]: tmpTotal }))
  }, [expenseCollection, expenseCategoryCollection]);

  useEffect(() => {
    const tmpTotal = fixedCostCategoryCollection.reduce((sum, category) => {
      return sum + (
        fixedCostCollection.find(item => (
          item.Date.getTime() === createDateWithoutDay().getTime() 
            && item.PlainText.Category === category
        ))?.PlainText.Amount || 0
      )
    }, 0);
    setTotal(prev => ({ ...prev, [CollectionNames.FixedCosts]: tmpTotal }));
  }, [fixedCostCollection, fixedCostCategoryCollection]);

  useEffect(() => {
    const tmpTotal = incomeCategoryCollection.reduce((sum, category) => {
      return sum + (
        incomeCollection.find(item => (
          item.Date.getTime() === createDateWithoutDay().getTime() 
            && item.PlainText.Category === category
        ))?.PlainText.Amount || 0
      )
    }, 0);
    setTotal(prev => ({ ...prev, [CollectionNames.Incomes]: tmpTotal }));
  }, [incomeCollection, incomeCategoryCollection]);

  useChangeBudgetCollection(expenseCategoryCollection, expenseBudgetCollection, 
    CollectionNames.ExpenseBudgets, setTotalBudget);
  useChangeBudgetCollection(fixedCostCategoryCollection, fixedCostBudgetCollection, 
    CollectionNames.FixedCostBudgets, setTotalBudget);
  useChangeBudgetCollection(incomeCategoryCollection, incomeBudgetCollection, 
    CollectionNames.IncomeBudgets, setTotalBudget);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow h-fit">
      <h2 className="text-lg font-semibold mb-4">合計</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">変動費</label>
          <input
            type="number"
            className={inputStyle}
            value={total[CollectionNames.Expenses]}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">固定費</label>
          <input
            type="number"
            className={inputStyle}
            value={total[CollectionNames.FixedCosts]}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">収入</label>
          <input
            type="number"
            className={inputStyle}
            value={total[CollectionNames.Incomes]}
            readOnly
          />
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">支出</span>
            <span className="font-bold">
              ¥{(total[CollectionNames.Expenses] + total[CollectionNames.FixedCosts]).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">収入</span>
            <span className="font-bold">
              ¥{total[CollectionNames.Incomes].toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">収支</span>
            <span className="font-bold">
            ¥{(total[CollectionNames.Incomes] - (total[CollectionNames.Expenses] + total[CollectionNames.FixedCosts])).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 