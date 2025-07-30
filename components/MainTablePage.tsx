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
import SlideInPanel from './SlideInPanel';
import { ChevronLeftIcon } from '@heroicons/react/16/solid';

export default function MainTablePage() {
  const [height, setHeight] = useState('0px');
  const ref = useRef<HTMLDivElement>(null);
  const { loading, user } = useAuth();
  const { sortedIncomeCategories } = useIncomeCategory();
  const { sortedFixedCostCategories } = useFixedCostCategory();
  const [showSlideInPanel, setShowSlideInPanel] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight ? `${ref.current.offsetHeight}px` : '100vh');
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
          <div className="flex-[5] min-w-0" style={{ height: `${height}` }}>
            {!loading && <ExpenseTable />}
          </div>
          <div ref={ref} className="flex-[1] space-y-4 hidden md:block">
            <IncomeSection />
            <FixedCostSection />
          </div>
        </div>
        {!showSlideInPanel && (
          <button
            className="fixed top-1/2 right-0 z-40 transform -translate-y-1/2 h-24 w-5 flex flex-col 
              items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors rounded-l-lg md:hidden"
            style={{ minWidth: '20px' }}
            onClick={() => setShowSlideInPanel(true)}
            aria-label="パネルを開く"
          >
            <ChevronLeftIcon className="w-4 h-8 text-gray-500" />
          </button>
        )}
        <SlideInPanel
          isOpen={showSlideInPanel}
          onClose={() => setShowSlideInPanel(false)}
          title=""
        >
          <IncomeSection />
          <div className="h-4"></div>
          <FixedCostSection />
        </SlideInPanel>
      </main>
    </div>
  );
}
