'use client';

import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function SlideInPanel({ isOpen, onClose, children, title }: SlideInPanelProps) {
  const handlers = useSwipeable({
    onSwipedLeft: onClose,
    trackTouch: true,
  });

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${isOpen ? '' : 'pointer-events-none'}`}
      style={{ transition: 'background 0.2s' }}
    >
      {/* オーバーレイ */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${isOpen ? 'opacity-40' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* パネル本体 */}
      <div
        {...handlers}
        className={`absolute right-0 top-0 h-full w-4/5 max-w-xs bg-white shadow-lg transition-transform duration-300 ease-in-out flex ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 左端の縦棒ボタン */}
        <button
          onClick={onClose}
          className="h-full w-5 flex flex-col items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors rounded-l-lg focus:outline-none"
          aria-label="閉じる"
          style={{ minWidth: '20px' }}
        >
          <ChevronRightIcon className="w-4 h-8 text-gray-500" />
        </button>
        {/* パネル内容 */}
        <div className="flex-1 flex flex-col min-w-0">
          {title && (
            <div className="border-b p-4 font-bold text-lg">{title}</div>
          )}
          <div className="p-4 overflow-y-auto h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}