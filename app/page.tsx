// app/page.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import IncomeSection from './components/IncomeSection';
import FixedCostSection from './components/FixedCostSection';
import ExpenseTable from './components/TableSection/ExpenseTable';
import DateSelector from './components/DateSelector';

function HomeContent() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, []);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8 max-w-[95%] bg-green-50 text-gray-900">
        <h1 className="text-3xl font-bold mb-6">家計簿</h1>
        
        <DateSelector />

        <div className="flex gap-4">
          <div className="flex-[5] min-w-0" style={{ height: `${height}px` }}>
            <ExpenseTable />
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

export default function Home() {
  return (
    <ExpenseProvider>
      <HomeContent />
    </ExpenseProvider>
  );
}