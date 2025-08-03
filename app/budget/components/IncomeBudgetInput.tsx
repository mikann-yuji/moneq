'use client';
import { inputStyle } from '@/styles/inputStyles';
import { useIncomeBudget } from '@/context/IncomeBudgetContext';

interface IncomeBudgetInputProps {
  category: string;
  pKey: string;
}

export default function IncomeBudgetInput({ 
  category, 
  pKey
}: IncomeBudgetInputProps) {
  const { setIncomeBudgetData, incomeBudgetDatas } = useIncomeBudget();

  const handleChange = (value: string) => {
    const incomeBudgetData = incomeBudgetDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = incomeBudgetData?.docId || '';
    setIncomeBudgetData(docId, pKey, amount);
  };

  const handleBlur = async (value: string) => {
    const incomeBudgetData = incomeBudgetDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = incomeBudgetData?.docId;

    setIncomeBudgetData(docId, pKey, amount, true);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
      <input
        type="number"
        className={inputStyle}
        placeholder="¥"
        value={(incomeBudgetDatas[pKey]?.amount || '').toString()}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
      />
    </div>
  );
} 