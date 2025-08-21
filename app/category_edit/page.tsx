'use client';

import Link from 'next/link';
import CategoryEditArea from './components/CategoryEditArea';
import { CollectionNames } from '@/localDB/type';

export default function CategoryEditPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6  max-w-[500px] mx-auto m-8 relative">
      <div className="flex items-center relative">
        <Link href="/" className="absolute left-0 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold flex-1 text-center">カテゴリー編集</h1>
      </div>
      <CategoryEditArea
        collectionName={CollectionNames.ExpenseCategory}
        title="変動費"
      />
      <div className="mt-8 pt-4 border-t"></div>
      <CategoryEditArea
        collectionName={CollectionNames.FixedCostCategory}
        title="固定費"
      />
      <div className="mt-8 pt-4 border-t"></div>
      <CategoryEditArea
        collectionName={CollectionNames.IncomeCategory}
        title="収入"
      />
    </div>
  );
} 