'use client';

import { useAuthStore } from './store';
import { signOut } from 'firebase/auth';
import { base64ToArrayBuffer, base64ToUint8Array, decryptDEK, deriveKEK } from '@/utils/crypto';
import { useRouter } from 'next/navigation';
import { localDB } from '@/localDB';
import { auth, firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLocalDBStore } from '@/localDB/store';

export const useAuth = () => {
  const { user, dek, setUser, setDek } = useAuthStore();
  const { clearCollection } = useLocalDBStore();
  const router = useRouter();

  const getDek = async (uid: string, password: string): Promise<CryptoKey | null> => {
    try {
      const docRef = doc(firestore, "UserKeys", uid);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
    
      const data = snapshot.data();
      const kek = await deriveKEK(password, base64ToUint8Array(data.Salt))

      return decryptDEK(
        base64ToArrayBuffer(data.EncryptedDek), 
        kek,
        base64ToUint8Array(data.IV)
      );
    } catch (error: any) {
      console.log(error.message);
      return null;
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth); // ログアウト処理
      clearCollection();
      localDB.tables.map(t => t.clear());
      router.push('/signin');
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
    }
  }

  return {
    user,
    dek,
    setUser,
    setDek,
    getDek,
    logOut,
  }
}