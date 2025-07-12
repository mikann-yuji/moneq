'use client';
import { inputStyle } from '@/styles/inputStyles';
import { useExpenseBudget } from '@/context/ExpenseBudgetContext';

interface ExpenseBudgetInputProps {
  category: string;
  pKey: string;
}

export default function ExpenseBudgetInput({ 
  category, 
  pKey
}: ExpenseBudgetInputProps) {
  const { setExpenseBudgetData, expenseBudgetDatas } = useExpenseBudget();

  const handleChange = (value: string) => {
    const expenseBudgetData = expenseBudgetDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = expenseBudgetData?.docId || '';
    setExpenseBudgetData(docId, pKey, amount);
  };

  const handleBlur = async (value: string) => {
    const expenseBudgetData = expenseBudgetDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = expenseBudgetData?.docId;

    setExpenseBudgetData(docId, pKey, amount, true);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
      <input
        type="number"
        className={inputStyle}
        placeholder="¥"
        value={(expenseBudgetDatas[pKey]?.amount || '').toString()}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
      />
    </div>
  );
} 