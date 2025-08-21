'use client';

import DateSelector from '@/app/components/DateSelector';
import ExpenseTable from '@/app/components/TableSection/ExpenseTable';
import { useCom } from '@/features/com/hooks';
import { CollectionNames } from '@/localDB/type';
import { ChevronLeftIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import HamburgerMenu from '../../components/HamburgerMenu';
import SideTable from './SideSection/SideTable';
import SlideInPanel from './SlideInPanel';

export default function MainTablePage() {
  const { isInitLoading } = useCom();
  const [showSlideInPanel, setShowSlideInPanel] = useState(false);

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
          <div className="flex-[5] min-w-0">
            {!isInitLoading && <ExpenseTable />}
          </div>
          <div className="flex-[1] space-y-4 hidden md:block">
            <SideTable
              title="収入"
              collectionName={CollectionNames.Incomes}
              collectionCategoryName={CollectionNames.IncomeCategory}
              collectionBudgetName={CollectionNames.IncomeBudgets}
            />
            <SideTable
              title="固定費"
              collectionName={CollectionNames.FixedCosts}
              collectionCategoryName={CollectionNames.FixedCostCategory}
              collectionBudgetName={CollectionNames.FixedCostBudgets}
            />
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
          <SideTable
            title="収入"
            collectionName={CollectionNames.Incomes}
            collectionCategoryName={CollectionNames.IncomeCategory}
            collectionBudgetName={CollectionNames.IncomeBudgets}
          />
          <div className="h-4"></div>
          <SideTable
            title="固定費"
            collectionName={CollectionNames.FixedCosts}
            collectionCategoryName={CollectionNames.FixedCostCategory}
            collectionBudgetName={CollectionNames.FixedCostBudgets}
          />
        </SlideInPanel>
      </main>
    </div>
  );
}
