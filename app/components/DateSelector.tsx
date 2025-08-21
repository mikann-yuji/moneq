'use client';

import { useCom } from '@/features/com/hooks';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function DateSelector() {
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = useCom();
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="mb-6">
      <div className="hidden md:flex gap-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="rounded px-3 py-2 w-32 bg-white"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}年</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {months.map(month => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-4 py-2 rounded cursor-pointer ${
                selectedMonth === month
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-green-100'
              }`}
            >
              {month}月
            </button>
          ))}
        </div>
      </div>

      {/* スマホ表示 */}
      <div className="md:hidden flex items-center justify-center gap-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="前月"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <div className="text-lg font-semibold">
            {selectedYear}年{selectedMonth}月
          </div>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="次月"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 