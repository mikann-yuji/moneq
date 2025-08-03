'use client';
import MainTablePage from '@/app/components/MainTablePage';
import { useAuth } from '@/context/AuthContext';
 
export default function Home() {
  const { loading } = useAuth();

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200/30 z-10">
          <div className="flex justify-center" aria-label="読み込み中">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </div>
      )}
      <MainTablePage />
    </div>
  );
}
