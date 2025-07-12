'use client';
import { useRef, useEffect } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Mode } from '@/constants/modes';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  currentAmount: number;
  pKey: string;
  mode: Mode | null;
}

export default function AmountInput({ value, onChange, onClose, currentAmount, pKey, mode }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateAmount, setExpenseData, expenseDatas, createAndUpdateExpenseData } = useExpense();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    try {
      const newAmount = parseInt(value) || 0;
      let totalAmount = currentAmount;

      if (mode === Mode.ADD) {
        totalAmount += newAmount;
      } else if (mode === Mode.SUBTRACT) {
        totalAmount -= newAmount;
      }
      const expenseData = expenseDatas[pKey]
      const docId = expenseData?.docId;

      setExpenseData(docId, pKey, totalAmount);
      // const [date, category] = pKey.split('_');
      // await createAndUpdateExpenseData(docId, date, category);
      console.log('金額を更新しました:', totalAmount);
      onClose();
    } catch (error) {
      console.error('金額の更新に失敗しました:', error);
    }
  };

  return (
    <div className="p-2">
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 border rounded"
        placeholder="金額を入力"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          OK
        </button>
      </div>
    </div>
  );
} 