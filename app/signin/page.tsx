'use client';

import { useAuth } from '@/features/auth/hooks';
import { useCom } from '@/features/com/hooks';
import { auth } from '@/lib/firebase';
import { localDB } from '@/localDB';
import { exportDek } from '@/utils/crypto';
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SingIn() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { loadUserInfo } = useCom();
  const { getDek, setDek } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      
      const user = auth.currentUser;
      if (user) {
        const dek = await getDek(user.uid, password);
        if (dek) {
          const rawDek = await exportDek(dek);
          await localDB.Dek.add({ id: 'dek', Dek: rawDek });
          setDek(dek);
          await loadUserInfo(user, () => {
            if (pathname && pathname !== "/signup") {
              router.push("/signin");
            }
          });
          router.push('/');
        } else {
          setError("DEKの取得に失敗しました。");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('予期しないエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200/30 z-10">
            <div className="flex justify-center" aria-label="読み込み中">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          </div>
        )}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">ログイン</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 text-sm">
            メールアドレスまたはパスワードが間違っています。{error}
          </div>
        )}
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <p
            onClick={() => router.push('/signup')} 
            className="text-blue-500 py-2 cursor-pointer"
          >
            アカウントがない場合はこちら
          </p>
          <button
            type="submit"
            className="w-full bg-sky-500 text-white py-2 px-4 rounded-md shadow hover:bg-sky-600 cursor-pointer"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
} 