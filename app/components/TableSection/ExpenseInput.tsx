'use client';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useExpense } from '../../context/ExpenseContext';
import ExpenseMenu from '../menu/ExpenseMenu';
import { inputStyle } from '../../styles/inputStyles';

interface ExpenseInputProps {
  day: number;
  category: string;
  selectedYear: number;
  selectedMonth: number;
  isMemo: boolean;
  dayIndex: number;
  catIndex: number;
  totalDays: number;
  totalCategories: number;
}

export default function ExpenseInput({ 
  day, 
  category, 
  selectedYear, 
  selectedMonth, 
  isMemo,
  dayIndex,
  catIndex,
  totalDays,
  totalCategories
}: ExpenseInputProps) {
  const { amounts, setAmount } = useExpense();

  const getDocId = () => {
    const key = `${day}_${category}`;
    return `${selectedYear}-${selectedMonth}-${key}`;
  };

  const docId = getDocId();

  const handleChange = (value: string) => {
    setAmount(docId, value ? parseInt(value) : 0);
  };

  const handleBlur = async (value: string) => {
    const docRef = doc(db, 'Expenses', docId);

    await setDoc(docRef, {
      Date: new Date(selectedYear, selectedMonth - 1, day),
      Category: category,
      Amount: value ? parseInt(value) : 0,
      UpdatedAt: new Date()
    }, { merge: true });
  };

  return (
    <td className={
      `p-1 bg-white 
      ${dayIndex === 0 && catIndex === 0 ? 'rounded-tl' : ''} 
      ${dayIndex === 0 && catIndex === totalCategories - 1 ? 'rounded-tr' : ''} 
      ${dayIndex === totalDays - 1 && catIndex === 0 ? 'rounded-bl' : ''} 
      ${dayIndex === totalDays - 1 && catIndex === totalCategories - 1 ? 'rounded-br' : ''}`
    }>
      <div className="relative">
        <input
          type={isMemo ? 'text' : 'number'}
          className={inputStyle}
          placeholder={isMemo ? 'メモ' : '¥'}
          value={(amounts[docId] || '').toString()}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={(e) => handleBlur(e.target.value)}
        />
        {!isMemo && (
          <ExpenseMenu
            currentAmount={amounts[docId] || 0}
            docId={docId}
          />
        )}
      </div>
    </td>
  );
} 