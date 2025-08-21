// app/page.tsx
'use client';

import { useAuth } from '@/features/auth/hooks';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logOut();
    setMenuOpen(false);
  };

  return (
    <div ref={menuRef}>
      <button
        className="p-2 rounded hover:bg-gray-200 focus:outline-none cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="メニューを開く"
      >
        {/* ハンバーガーアイコン */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
          <Link
            href="/input"
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            当日入力
          </Link>
          <Link
            href="/budget"
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            予算入力
          </Link>
          <Link
            href="/category_edit"
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            カテゴリー編集
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
