'use client';
import { useExpense } from '@/context/ExpenseContext';
import ExpenseMenu from '@/components/Menu/ExpenseMenu';
import { inputStyle } from '@/styles/inputStyles';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { useRouter } from 'next/navigation';
import { useIncome } from '@/context/IncomeContext';

interface IncomeInputProps {
  category: string;
  pKey: string;
}

export default function IncomeInput({ 
  category, 
  pKey
}: IncomeInputProps) {
  const { user } = useAuth();
  const { dek } = useDek();
  const router = useRouter();
  const { setIncomeData, incomeDatas } = useIncome();

  const handleChange = (value: string) => {
    const incomeData = incomeDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = incomeData?.docId || '';
    setIncomeData(docId, pKey, amount);
    console.log(pKey);
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