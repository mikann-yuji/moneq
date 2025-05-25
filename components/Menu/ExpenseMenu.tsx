'use client';
import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AmountInput from './AmountInput';
import { Mode } from '@/constants/modes';
import { ExpenseMenuMode } from '@/constants/expenseMenuModes';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

interface ExpenseMenuProps {
  currentAmount: number;
  docId: string;
}

interface Detail {
  id: string;
  Amount: number;
  Memo: string;
  Date: Date; // もしくは適切な型
}

export default function ExpenseMenu({ currentAmount, docId }: ExpenseMenuProps) {
  const [isActive, setIsActive] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<Mode | null>(null);
  const [expenseMenuMode, setExpenseMenuMode] = useState<ExpenseMenuMode>(ExpenseMenuMode.DEFAULT);
  const [details, setDetails] = useState<Detail[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItemStyle = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setExpenseMenuMode(ExpenseMenuMode.DEFAULT);
      }
    };

    if (isActive) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isActive]);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.top,
      left: rect.right + 8,
    });
    setIsActive(!isActive);
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

  const handleShowDetails = async () => {
    const detailsRef = collection(db, 'Expenses', docId, 'Details');
    const detailsSnap = await getDocs(detailsRef);
    const detailsData = detailsSnap.docs.map(doc => ({ 
      id: doc.id,
      Amount: doc.data().Amount,
      Memo: doc.data().Memo,
      Date: doc.data().Date
    }));
    setDetails(detailsData);
  };

  const handleDetailClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleShowDetails();
    setExpenseMenuMode(ExpenseMenuMode.DETAIL);
  };

  return (
    <>
      <button
        className="absolute right-0 top-0 h-full px-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        onClick={handleMenuClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {isActive &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPosition.top,
              left: menuPosition.left,
            }}
            className="w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200"
          >
            <div className="py-1">
              {expenseMenuMode === ExpenseMenuMode.INPUT ? (
                <AmountInput
                  value={inputValue}
                  onChange={handleInputChange}
                  onClose={handleClose}
                  currentAmount={currentAmount}
                  docId={docId}
                  mode={mode}
                />
              ) : expenseMenuMode === ExpenseMenuMode.DETAIL ? (
                details.length > 0 && (
                  <div className="mt-2">
                    <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-1 py-1 text-sm text-center">日付</th>
                        <th className="px-1 py-1 text-sm text-center">金額</th>
                        <th className="px-1 py-1 text-sm text-center">メモ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map(detail => (
                        <tr key={detail.id}>
                          <td className="px-1 py-1 text-sm text-center">{format(detail.Date, 'H:mm')}</td>
                          <td className="px-1 py-1 text-sm text-center">{detail.Amount}</td>
                          <td className="px-1 py-1 text-sm text-center">{detail.Memo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )
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
                  <button
                    className={menuItemStyle}
                    onClick={handleDetailClick}
                  >
                    詳細
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
} 