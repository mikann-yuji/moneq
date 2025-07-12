'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deriveKEK, decryptDEK, base64ToUint8Array, base64ToArrayBuffer } from '@/utils/crypto';

interface DekContextType {
  dek: CryptoKey | null;
  setDek: (key: CryptoKey | null) => void;
  getDek: (uid: string, password: string) => Promise<CryptoKey | null>;
}

const DekContext = createContext<DekContextType | undefined>(undefined);

export function DekProvider({ children }: { children: ReactNode }) {
  const [dek, setDek] = useState<CryptoKey | null>(null);

  const getDek = async (uid: string, password: string): Promise<CryptoKey | null> => {
    try {
      const docRef = doc(db, "UserKeys", uid);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
    
      const data = snapshot.data();
      const kek = await deriveKEK(password, base64ToUint8Array(data.Salt))
      console.log('test');

      return decryptDEK(
        base64ToArrayBuffer(data.EncryptedDek), 
        kek,
        base64ToUint8Array(data.IV)
      );
    } catch (error: any) {
      console.log(error.message);
      return null;
    }
    
  };

  return (
    <DekContext.Provider value={{ dek, setDek, getDek }}>
      {children}
    </DekContext.Provider>
  );
}

export function useDek() {
  const context = useContext(DekContext);
  if (context === undefined) {
    throw new Error('useDek must be used within an DekProvider');
  }
  return context;
}