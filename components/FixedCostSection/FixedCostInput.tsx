'use client';
import { inputStyle } from '@/styles/inputStyles';
import { useFixedCost } from '@/context/FixedCostContext';

interface FixedCostInputProps {
  category: string;
  pKey: string;
}

export default function FixedCostInput({ 
  category, 
  pKey
}: FixedCostInputProps) {
  const { setFixedCostData, fixedCostDatas } = useFixedCost();

  const handleChange = (value: string) => {
    const fixedCostData = fixedCostDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = fixedCostData?.docId || '';
    setFixedCostData(docId, pKey, amount);
  };

  const handleBlur = async (value: string) => {
    const fixedCostData = fixedCostDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = fixedCostData?.docId;

    setFixedCostData(docId, pKey, amount, true);
  };

  return (
    <div key={category}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
      <input
        type="number"
        className={inputStyle}
        placeholder="¥"
        value={(fixedCostDatas[pKey]?.amount || '').toString()}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
      />
    </div>
  );
} 