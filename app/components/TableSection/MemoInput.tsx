'use client';

import { useAuth } from '@/features/auth/hooks';
import { useCom } from '@/features/com/hooks';
import { useLocalDB } from '@/localDB/hooks';
import { Memo } from '@/localDB/model/memo';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionNames } from '@/localDB/type';
import { inputStyle } from '@/styles/inputStyles';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

interface MemoInputProps {
  day: number
}

export default function MemoInput({ 
  day
}: MemoInputProps) {
  const { putCollection, createDataWithID } = useLocalDB();
  const { createDateWithDay } = useCom();
  const { user, dek } = useAuth();

  const router = useRouter();
  const originalMemoRef = useRef<string | null>(null);
  const date = createDateWithDay(day);
  const memoData = useLocalDBStore(state => state.collections[CollectionNames.Memos].find(
    item => item.Date.getTime() === date.getTime()));

  const handleChange = (value: string) => {
    const memo = value || '';
    if (dek && user) {
      if (memoData) {
        const updateData: Memo = {
          ...memoData,
          PlainText: {
            ...memoData.PlainText,
            Memo: memo,
          },
          Synced: false,
        }
        putCollection(CollectionNames.Memos, updateData, dek, user);
      } else {
        const createData = createDataWithID(
          CollectionNames.Memos,
          {
            PlainText: {
              Memo: memo,
            },
            Date: date,
            Synced: false,
          }
        );
        putCollection(CollectionNames.Memos, createData, dek, user);
      }
    } else {
      router.push("/signin");
    }
  };

  const handleBlur = (value: string) => {
    const memo = value || '';
    if (originalMemoRef.current !== null
      && originalMemoRef.current === memo) return;

    if (dek && user) {
      if (memoData) {
        const updateData: Memo = {
          ...memoData,
          PlainText: {
            ...memoData.PlainText,
            Memo: memo,
          },
          Synced: false,
        }
        putCollection(CollectionNames.Memos, updateData, dek, user, true);
      }
    } else {
      router.push("/signin");
    }
  };

  return (
    <input
      key={day}
      type='text'
      className={`${inputStyle} w-30`}
      placeholder='メモ'
      value={memoData?.PlainText.Memo || ''}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={() => originalMemoRef.current = memoData?.PlainText.Memo ?? ""}
      onBlur={(e) => handleBlur(e.target.value)}
    />
  );
} 