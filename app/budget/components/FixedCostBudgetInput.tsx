'use client';
import { inputStyle } from '@/styles/inputStyles';
import { useFixedCostBudget } from '@/context/FixedCostBudgetContext';

interface FixedCostBudgetInputProps {
  category: string;
  pKey: string;
}

export default function FixedCostBudgetInput({ 
  category, 
  pKey
}: FixedCostBudgetInputProps) {
  const { setFixedCostBudgetData, fixedCostBudgetDatas } = useFixedCostBudget();

  const handleChange = (value: string) => {
    const fixedCostBudgetData = fixedCostBudgetDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = fixedCostBudgetData?.docId || '';
    setFixedCostBudgetData(docId, pKey, amount);
  };

  const handleBlur = async (value: string) => {
    const fixedCostBudgetData = fixedCostBudgetDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = fixedCostBudgetData?.docId;

    setFixedCostBudgetData(docId, pKey, amount, true);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
      <input
        type="number"
        className={inputStyle}
        placeholder="¥"
        value={(fixedCostBudgetDatas[pKey]?.amount || '').toString()}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
      />
    </div>
  );
} 