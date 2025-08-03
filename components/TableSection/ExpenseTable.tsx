'use client';
import { useEffect, useRef, useState } from 'react';
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
  const tableRef = useRef<HTMLTableSectionElement>(null);
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const [theadWidth, setTheadWidth] = useState(0);
  const fixedHeaderRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // テーブルヘッダーの上端固定
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFixedHeader(!entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: '0px' }
    );

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    if (scrollContainerRef.current) {
      setTheadWidth(scrollContainerRef.current.offsetWidth);
    }

    return () => {
      if (tableRef.current) observer.unobserve(tableRef.current);
    };
  }, []);

  // カラム幅の同期
  useEffect(() => {
    const updateColWidths = () => {
      if (scrollContainerRef.current) {
        setTheadWidth(scrollContainerRef.current.offsetWidth);
      }
    };

    updateColWidths();

    const resizeObserver = new ResizeObserver(updateColWidths);
    if (scrollContainerRef.current) resizeObserver.observe(scrollContainerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // テーブルヘッダーのスクロール同期
  useEffect(() => {
    const onScroll = () => {
      if (
        scrollContainerRef.current &&
        fixedHeaderRef.current &&
        showFixedHeader
      ) {
        fixedHeaderRef.current.scrollLeft = scrollContainerRef.current.scrollLeft;
      }
    };

    scrollContainerRef.current?.addEventListener("scroll", onScroll);
    return () =>
      scrollContainerRef.current?.removeEventListener("scroll", onScroll);
  }, [showFixedHeader]);

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
    <div className="relative h-min-full">
      {showFixedHeader && (
        <div className="fixed top-0 bg-white shadow z-30" style={{ width: theadWidth }}>
          <div ref={fixedHeaderRef} className="overflow-x-auto scrollbar-hide">
            <table className="table-fixed min-w-max">
              <thead>
                <tr>
                  <th className="bg-green-200 p-2 sticky top-0 left-0 z-20 w-[33.8px]"></th>
                  <th className="bg-green-200 p-2 sticky top-0 left-[33.8px] z-20 w-8"></th>
                  {headerCategories.map(category => (
                    <th key={category} className="bg-green-200 p-2 sticky top-0 z-10 w-32">
                      {category}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
        </div>
      )}
      <div ref={scrollContainerRef} className="overflow-x-auto h-full">
        <table className="table-fixed">
          <thead ref={tableRef}>
            <tr>
              <th className="bg-green-200 p-2 sticky top-0 left-0 z-20"></th>
              <th className="bg-green-200 p-2 sticky top-0 left-[33.8px] z-20"></th>
              {headerCategories.map(category => (
                <th key={category} className="bg-green-200 p-2 sticky top-0 z-10">
                  {category}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const date = new Date(selectedYear, selectedMonth - 1, day);
              const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
              
              return (
                <tr key={day}>
                  <td className="p-2 font-semibold bg-green-200 text-center sticky left-0 z-10">
                    {day}
                  </td>
                  <td className="p-2 font-semibold bg-green-200 text-center sticky left-[33.8px] z-10">
                    {weekday}
                  </td>
                  {headerCategories.map((category) => (
                    <ExpenseInput
                      key={category}
                      isMemo={category === 'memo'}
                      pKey={`${selectedYear}-${selectedMonth}-${day}_${category}`} 
                    />
                  ))}
                </tr>
              );
            })}
            <tr>
              <td colSpan={2} className="p-2 font-semibold bg-green-200 text-center sticky left-0 z-10">
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
              <td colSpan={2} className="p-2 font-semibold bg-green-200 text-center sticky left-0 z-10">
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
              <td colSpan={2} className="p-2 font-semibold bg-green-200 text-center sticky left-0 z-10">
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
    </div>
  );
} 