'use client';
import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AmountInput from './AmountInput';
import { Mode } from '@/constants/modes';

interface ExpenseMenuProps {
  currentAmount: number;
  docId: string;
}

export default function ExpenseMenu({ currentAmount, docId }: ExpenseMenuProps) {
  const [isActive, setIsActive] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<Mode | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItemStyle = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setIsInputMode(false);
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
    setIsInputMode(false);
  };

  const handleAddAmountClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsInputMode(true);
    setMode(Mode.ADD);
  };

  const handleSubtractAmountClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsInputMode(true);
    setMode(Mode.SUBTRACT);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleClose = () => {
    setIsInputMode(false);
    setIsActive(false);
    setInputValue('');
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
              {isInputMode ? (
                <AmountInput
                  value={inputValue}
                  onChange={handleInputChange}
                  onClose={handleClose}
                  currentAmount={currentAmount}
                  docId={docId}
                  mode={mode}
                />
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
                    onClick={(e) => {
                      e.stopPropagation();
                      /* 詳細表示処理 */
                    }}
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