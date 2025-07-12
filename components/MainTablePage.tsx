// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import IncomeSection from '@/components/IncomeSection/IncomeTable';
import FixedCostSection from '@/components/FixedCostSection/FixedCostTable';
import ExpenseTable from '@/components/TableSection/ExpenseTable';
import DateSelector from '@/components/DateSelector';
import { useAuth } from '@/context/AuthContext';
import { useIncomeCategory } from '@/context/IncomeCategoryContext';
import { useFixedCostCategory } from '@/context/FixedCostCategoryContext';
import HamburgerMenu from './HamburgerMenu';

export default function MainTablePage() {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { loading, user } = useAuth();
  const { sortedIncomeCategories } = useIncomeCategory();
  const { sortedFixedCostCategories } = useFixedCostCategory();

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [user, sortedIncomeCategories, sortedFixedCostCategories]);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8 max-w-[95%] bg-green-50 text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">家計簿</h1>
          <div className="relative">
            <HamburgerMenu />
          </div>
        </div>
        <DateSelector />
        <div className="flex gap-4">
          <div className="flex-[5] min-w-0" style={{ height: `${height}px` }}>
            {!loading && <ExpenseTable />}
          </div>
          <div ref={ref} className="flex-[1] space-y-4">
            <IncomeSection />
            <FixedCostSection />
          </div>
        </div>
      </main>
    </div>
  );
}
