'use client';

import { useExpense } from '@/context/ExpenseContext';
import ExpenseMenu from '@/components/Menu/ExpenseMenu';
import { inputStyle } from '@/styles/inputStyles';
import MemoInput from './MemoInput';

interface ExpenseInputProps {
  isMemo: boolean;
  pKey: string;
}

export default function ExpenseInput({ 
  isMemo,
  pKey
}: ExpenseInputProps) {
  const { expenseDatas, setExpenseData } = useExpense();

  const handleChange = (value: string) => {
    const expenseData = expenseDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = expenseData?.docId || '';
    setExpenseData(docId, pKey, amount);
  };

  const handleBlur = async (value: string) => {
    const expenseData = expenseDatas[pKey]
    const amount = value ? parseInt(value) : 0;
    const docId = expenseData?.docId;

    setExpenseData(docId, pKey, amount);
  };

  return (
    <td className="p-1 bg-white">
      <div className="relative">
        {
          isMemo 
            ? <MemoInput pKey={pKey.split('_')[0]} />
            : (
              <>
                <input
                  type='number'
                  className={`${inputStyle} w-30`}
                  placeholder='¥'
                  value={(expenseDatas[pKey]?.amount || '').toString()}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={(e) => handleBlur(e.target.value)}
                />
                {expenseDatas[pKey]?.amount != 0 && expenseDatas[pKey]?.amount != undefined && (
                  <ExpenseMenu
                    currentAmount={expenseDatas[pKey].amount || 0}
                    pKey={pKey}
                  />
                )}
              </>
            )
        }
      </div>
    </td>
  );
} 