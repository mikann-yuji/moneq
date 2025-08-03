'use client';
import { inputStyle } from '@/styles/inputStyles';
import { useIncome } from '@/context/IncomeContext';

interface IncomeInputProps {
  category: string;
  pKey: string;
}

export default function IncomeInput({ 
  category, 
  pKey
}: IncomeInputProps) {
  const { setIncomeData, incomeDatas } = useIncome();

  const handleChange = (value: string) => {
    const incomeData = incomeDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = incomeData?.docId || '';
    setIncomeData(docId, pKey, amount);
  };

  const handleBlur = async (value: string) => {
    const incomeData = incomeDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = incomeData?.docId || '';

    setIncomeData(docId, pKey, amount, true);
  };

  return (
    <div key={category}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
      <input
        type="number"
        className={inputStyle}
        placeholder="¥"
        value={(incomeDatas[pKey]?.amount || '').toString()}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
      />
    </div>
  );
} 