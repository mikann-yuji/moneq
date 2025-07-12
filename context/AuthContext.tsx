'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { importDek } from '@/utils/crypto';
import { useDek } from '@/context/DekContext';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logOut: () => Promise<void>;
  setLoadingState: (loadingState: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { setDek } = useDek();
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const rawDEK = sessionStorage.getItem("dek");
        if (rawDEK) {
          const dek = await importDek(rawDEK);
          setDek(dek);
        }
      } else {
        setDek(null);
        sessionStorage.removeItem('dek');
        router.push('/signin');
      }
    });

    return () => unsubscribe(); // クリーンアップ
  }, []);

  const logOut = async () => {
    try {
      await signOut(auth); // ログアウト処理
      router.push('/signin');
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
    }
  }

  const setLoadingState = (loadingState: boolean) => {
    setLoading(loadingState);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logOut, setLoadingState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}