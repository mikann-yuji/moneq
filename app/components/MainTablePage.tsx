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
  const [isInputTop, setIsInputTop] = useState(localStorage.getItem("isInputTop") === "true")

  const handleChange = (checked: boolean) => {
    localStorage.setItem("isInputTop", String(checked));
    setIsInputTop(checked);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8 max-w-[95%] bg-green-50 text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">
            家計簿
            <label className="inline-flex items-center cursor-pointer ml-5">
              <input 
                type="checkbox" 
                value=""
                className="sr-only peer"
                checked={isInputTop}
                onChange={(e) => handleChange(e.target.checked)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">入力ページをトップにする</span>
            </label>
          </h1>
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
