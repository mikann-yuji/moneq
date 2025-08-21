'use client';

import { ExpenseMenuMode } from '@/constants/expenseMenuModes';
import { Mode } from '@/constants/modes';
import { useCom } from '@/features/com/hooks';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionNames } from '@/localDB/type';
import { useEffect, useRef, useState } from 'react';
import AmountInput from './AmountInput';
import DetailTable from './DetailTable';

interface ExpenseMenuProps {
  currentAmount: number;
  category: string;
  day: number;
}

export default function ExpenseMenu({ currentAmount, category, day }: ExpenseMenuProps) {
  const [isActive, setIsActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<Mode | null>(null);
  const [expenseMenuMode, setExpenseMenuMode] = useState<ExpenseMenuMode>(ExpenseMenuMode.DEFAULT);
  const menuRef = useRef<HTMLDivElement>(null);
  const { createDateWithDay } = useCom();

  const expenseData =  useLocalDBStore(state => state.collections[CollectionNames.Expenses].find(item => (
    item.PlainText.Category === category && item.Date.getTime() === createDateWithDay(day).getTime()
  )));
  const menuItemStyle = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setExpenseMenuMode(ExpenseMenuMode.DEFAULT);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive]);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isActive) return;
    setIsActive(true);
    setExpenseMenuMode(ExpenseMenuMode.DEFAULT);
  };

  const handleAddAmountClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setExpenseMenuMode(ExpenseMenuMode.INPUT);
    setMode(Mode.ADD);
  };

  const handleSubtractAmountClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setExpenseMenuMode(ExpenseMenuMode.INPUT);
    setMode(Mode.SUBTRACT);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleClose = () => {
    setExpenseMenuMode(ExpenseMenuMode.DEFAULT);
    setIsActive(false);
    setInputValue('');
  };

  const handleDetailClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setExpenseMenuMode(ExpenseMenuMode.DETAIL);
  };

  return (
    <>
      <button
        className="absolute right-0 top-0 h-full px-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        onMouseDown={handleMenuClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {isActive &&
        (
          <div
            ref={menuRef}
            className="absolute top-full left-0 w-48 bg-white 
              rounded-md shadow-lg z-20 border border-gray-200"
          >
            <div className="py-1">
              {expenseMenuMode === ExpenseMenuMode.INPUT ? (
                <AmountInput
                  value={inputValue}
                  onChange={handleInputChange}
                  onClose={handleClose}
                  currentAmount={currentAmount}
                  mode={mode}
                  day={day}
                  category={category}
                />
              ) : expenseMenuMode === ExpenseMenuMode.DETAIL ? (
                <DetailTable day={day} category={category} />
              ) : (
                <div>
                  <button
                    className={menuItemStyle}
                    onClick={handleAddAmountClick}
                  >
                    金額を足す
                  </button>
                  <button
                    className={menuItemStyle}
                    onClick={handleSubtractAmountClick}
                  >
                    金額を引く
                  </button>
                  {
                    expenseData?.PlainText.Details 
                    && expenseData.PlainText.Details.length > 0 && (
                      <button
                        className={menuItemStyle}
                        onClick={handleDetailClick}
                      >
                        詳細
                      </button>
                    )
                  }
                  
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
} 