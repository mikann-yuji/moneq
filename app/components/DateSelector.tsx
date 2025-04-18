'use client';
import { useExpense } from '../context/ExpenseContext';

export default function DateSelector() {
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = useExpense();
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="flex gap-4 mb-6">
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
            className={`px-4 py-2 rounded ${
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
  );
} 