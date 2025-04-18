'use client';
import { useEffect } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import ExpenseInput from './ExpenseInput';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ExpenseTable() {
  const { selectedYear, selectedMonth, amounts, setAmount } = useExpense();
  const categories = ['食費', '日用品', '交通費', '交際費', '趣味', 'その他', 'memo'];
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      
      const q = query(
        collection(db, 'Expenses'),
        where('Date', '>=', startDate),
        where('Date', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const day = data.Date.toDate().getDate();
        const category = data.Category;
        const docId = `${selectedYear}-${selectedMonth}-${day}_${category}`;
        setAmount(docId, data.Amount);
      });
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="overflow-auto h-full">
      <table className="w-full">
        <thead className="bg-green-200 sticky top-0 z-10">
          <tr>
            <th className="p-2"></th>
            <th className="p-2"></th>
            {categories.map(category => (
              <th key={category} className="p-2">
                {category}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
            
            return (
              <tr key={day}>
                <td className="p-2 font-semibold bg-green-200 text-center">
                  {day}
                </td>
                <td className="p-2 font-semibold bg-green-200 text-center">
                  {weekday}
                </td>
                {categories.map((category, catIndex) => (
                  <ExpenseInput
                    key={category}
                    day={day}
                    category={category}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    isMemo={category === 'memo'}
                    dayIndex={dayIndex}
                    catIndex={catIndex}
                    totalDays={daysInMonth}
                    totalCategories={categories.length}
                  />
                ))}
              </tr>
            );
          })}
          <tr>
            <td colSpan={2} className="p-2 font-semibold bg-green-200 text-center">
              合計
            </td>
            {categories.map(category => (
              <td key={category} className="p-2 font-semibold bg-green-200">
                {days.reduce((sum, day) => {
                  const docId = `${selectedYear}-${selectedMonth}-${day}_${category}`;
                  return sum + (amounts[docId] || 0);
                }, 0).toLocaleString()}円
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
} 