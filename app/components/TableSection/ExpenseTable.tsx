'use client';

import { useAuth } from '@/features/auth/hooks';
import { useCom } from '@/features/com/hooks';
import { firestore } from '@/lib/firebase';
import { useLocalDB } from '@/localDB/hooks';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionNames } from '@/localDB/type';
import { collection, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import ExpenseInput from './ExpenseInput';
import { useSortCategory } from '@/hooks/useSortCategory';

export default function ExpenseTable() {
  const { selectedYear, selectedMonth, createDateWithDay } = useCom();
  const { user, dek } = useAuth();
  const { syncFromFirestore } = useLocalDB();

  const [totalCategoryExpense, setTotalCategoryExpense] = useState<{ [key: string]: number }>({});
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const [theadWidth, setTheadWidth] = useState(0);

  const tableRef = useRef<HTMLTableSectionElement>(null);
  const fixedHeaderRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  const headerCategories = useSortCategory(CollectionNames.ExpenseCategory, ["memo"]);
  const expenseCollection = useLocalDBStore(state => state.collections[CollectionNames.Expenses]);
  const expenseBudgetCollection = useLocalDBStore(state => state.collections[CollectionNames.ExpenseBudgets]);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", onScroll);

    if (showFixedHeader && container && fixedHeaderRef.current) {
      fixedHeaderRef.current.scrollLeft = container.scrollLeft;
    }

    return () => container?.removeEventListener("scroll", onScroll);
  }, [showFixedHeader]);

  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      
      if (dek && user) {
        const expensesQ = query(
          collection(firestore, 'Expenses'),
          where('Date', '>=', startDate),
          where('Date', '<=', endDate),
          where('UserId', '==', user.uid)
        );
        const memoQ = query(
          collection(firestore, 'Memos'),
          where('Date', '>=', startDate),
          where('Date', '<=', endDate),
          where('UserId', '==', user.uid)
        );

        await syncFromFirestore(expensesQ, dek, CollectionNames.Expenses);
        await syncFromFirestore(memoQ, dek, CollectionNames.Memos);
      }
    }

    fetchData();
  }, [selectedYear, selectedMonth, dek, user]);

  useEffect(() => {
    headerCategories.forEach(category => {
      const total = days.reduce((sum, day) => {
        return sum + (
          expenseCollection.find(item => (
            item.PlainText.Category === category && item.Date.getTime() === createDateWithDay(day).getTime()
          ))?.PlainText.Amount || 0
        );
      }, 0);
      setTotalCategoryExpense(prev => ({...prev, [category]: total}));
    });
  }, [expenseCollection]);

  return (
    <div className="relative h-min-full">
      {showFixedHeader && (
        <div className="fixed top-0 bg-white shadow z-30" style={{ maxWidth: theadWidth }}>
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
                      category={category}
                      day={day}
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
                        {(expenseBudgetCollection.find(
                          item => item.PlainText.Category == category)?.PlainText.Amount || '-').toLocaleString()}円
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
                        {(() => {
                          const amount = expenseBudgetCollection.find(
                            item => item.PlainText.Category == category)?.PlainText.Amount;
                          return typeof amount === "number"
                            ? (amount - totalCategoryExpense[category]).toLocaleString() + "円"
                            : "-";
                        })()}
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