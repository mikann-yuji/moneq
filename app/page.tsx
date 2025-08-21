'use client';

import MainTablePage from '@/app/components/MainTablePage';
import { useCom } from '@/features/com/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
 
export default function Home() {
  const { isInitLoading } = useCom(); 
  const router = useRouter();

  useEffect(() => {
    const isInputTop = localStorage.getItem("isInputTop");
    const hasVisited = sessionStorage.getItem("hasVisited");

    if (!hasVisited && isInputTop === "true") {
      // 初回訪問 → フラグをセット
      sessionStorage.setItem("hasVisited", "true");
      // /input にリダイレクト
      router.replace("/input");
    }
  }, [router]);

  return (
    <div className="relative">
      {isInitLoading 
        ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200/30 z-10">
            <div className="flex justify-center" aria-label="読み込み中">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          </div>
        )
        : <MainTablePage />
      }
    </div>
  );
}
