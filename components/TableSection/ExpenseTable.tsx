'use client';
import { useEffect, useState } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import ExpenseInput from './ExpenseInput';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useExpenseCategory } from '@/context/ExpenseCategoryContext';
import { useExpenseBudget } from '@/context/ExpenseBudgetContext';
import { useExpenseMemo } from '@/context/MemoContext';

export default function ExpenseTable() {
  const { selectedYear, selectedMonth, getAndSetExpenseData, expenseDatas } = useExpense();
  const { getAndSetMemoData } = useExpenseMemo();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const { user } = useAuth();
  const { dek } = useDek();
  const { sortedExpenseCategories } = useExpenseCategory();
  const headerCategories = [...sortedExpenseCategories, 'memo'];
  const { expenseBudgetDatas } = useExpenseBudget();
  const [totalCategoryExpense, setTotalCategoryExpense] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      
      const expensesQ = query(
        collection(db, 'Expenses'),
        where('Date', '>=', startDate),
        where('Date', '<=', endDate),
        where('UserId', '==', user?.uid || '')
      );
      const memoQ = query(
        collection(db, 'Memos'),
        where('Date', '>=', startDate),
        where('Date', '<=', endDate),
        where('UserId', '==', user?.uid || '')
      );

      if (dek) {
        getAndSetExpenseData(expensesQ, dek);
        getAndSetMemoData(memoQ, dek);
      }
    }

    fetchData();
  }, [selectedYear, selectedMonth, dek]);

  useEffect(() => {
    headerCategories.forEach(category => {
      const total = days.reduce((sum, day) => {
        const pKey = `${selectedYear}-${selectedMonth}-${day}_${category}`;
        return sum + (expenseDatas[pKey]?.amount || 0);
      }, 0);
      setTotalCategoryExpense(prev => ({...prev, [category]: total}));
    });
  }, [expenseDatas]);

  return (
    <div className="overflow-auto h-full">
      <table className="w-full">
        <thead className="bg-green-200 sticky top-0 z-10">
          <tr>
            <th className="p-2"></th>
            <th className="p-2"></th>
            {headerCategories.map(category => (
              <th key={category} className="p-2">
                {category}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
            
            return (
              <tr key={day}>
                <td className="p-2 font-semibold bg-green-200 text-center">
                  {day}
                </td>
                <td className="p-2 font-semibold bg-green-200 text-center">
                  {weekday}
                </td>
                {headerCategories.map((category, catIndex) => (
                  <ExpenseInput
                    key={category}
                    isMemo={category === 'memo'}
                    dayIndex={dayIndex}
                    catIndex={catIndex}
                    totalDays={daysInMonth}
                    totalCategories={headerCategories.length}
                    pKey={`${selectedYear}-${selectedMonth}-${day}_${category}`} 
                  />
                ))}
              </tr>
            );
          })}
          <tr>
            <td colSpan={2} className="p-2 font-semibold bg-green-200 text-center">
              合計
            </td>
            {headerCategories.map(category => (
              category == 'memo' 
              ? (<td key={category} className="p-2 font-semibold bg-gray-200"></td>)
              : (
                  <td key={category} className="p-2 font-semibold bg-green-200">
                    {(totalCategoryExpense[category] || 0).toLocaleString()}円
                  </td>
                )
            ))}
          </tr>
          <tr>
            <td colSpan={2} className="p-2 font-semibold bg-green-200 text-center">
              予算
            </td>
            {headerCategories.map(category => (
              category == 'memo' 
                ? (<td key={category} className="p-2 font-semibold bg-gray-200"></td>)
                : (
                    <td key={category} className="p-2 font-semibold bg-green-200">
                      {(expenseBudgetDatas[category]?.amount || '-').toLocaleString()}円
                    </td>
                  )
            ))}
          </tr>
          <tr>
            <td colSpan={2} className="p-2 font-semibold bg-green-200 text-center">
              残
            </td>
            {headerCategories.map(category => (
              category == 'memo' 
                ? (<td key={category} className="p-2 font-semibold bg-gray-200"></td>)
                : (
                    <td key={category} className="p-2 font-semibold bg-green-200">
                      {((expenseBudgetDatas[category]?.amount - totalCategoryExpense[category]) || '-').toLocaleString()}円
                    </td>
                  )
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
} 