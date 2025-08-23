'use client';

import { useAuth } from '@/features/auth/hooks';
import { useCom } from '@/features/com/hooks';
import { useLocalDB } from '@/localDB/hooks';
import { Income } from '@/localDB/model/income';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionNames } from '@/localDB/type';
import { inputStyle } from '@/styles/inputStyles';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

type SideTableInputProps<
  K extends CollectionNames.FixedCosts
  | CollectionNames.Incomes
> = {
  collectionName: K;
  category: string;
}

export default function SideTableInput<
  K extends CollectionNames.FixedCosts
  | CollectionNames.Incomes
>({
  collectionName,
  category,
}: SideTableInputProps<K>) {
  const { putCollection, createDataWithID } = useLocalDB();
  const { createDateWithoutDay } = useCom();
  const { user, dek } = useAuth();

  const router = useRouter();
  const originalAmountRef = useRef<number | null>(null);
  const amountData = useLocalDBStore(state => state.collections[collectionName].find(item => (
    item.PlainText.Category === category && item.Date.getTime() == createDateWithoutDay().getTime()
  )));

  const handleChange = (value: string) => {
    const amount = value ? parseInt(value) : 0;

    if (dek && user) {
      if (amountData) {
        const updateData: Income = {
          ...amountData,
          PlainText: {
            ...amountData.PlainText,
            Amount: amount,
          },
          Synced: false,
        }
        putCollection(collectionName, updateData, dek, user);
      } else {
        const createData = createDataWithID<CollectionNames.FixedCosts | CollectionNames.Incomes>(
          collectionName,
          {
            PlainText: {
              Amount: amount,
              Category: category,
            },
            Date: createDateWithoutDay(),
            Synced: false,
          }
        );
        putCollection(collectionName, createData, dek, user);
      }
    } else {
      router.push("/signin");
    }
  };

  const handleBlur = async (value: string) => {
    const amount = value ? parseInt(value) : 0;
    if (originalAmountRef.current !== null
      && originalAmountRef.current === amount) return;

    if (dek && user) {
      if (amountData) {
        const updateData = {
          ...amountData,
          PlainText: {
            ...amountData.PlainText,
            Amount: amount,
          },
          Synced: false,
        }
        putCollection(collectionName, updateData, dek, user, true);
      }
    } else {
      router.push("/signin");
    }
  };

  return (
    <div key={category}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
      <input
        type="number"
        className={inputStyle}
        placeholder="¥"
        value={(amountData?.PlainText.Amount || '').toString()}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => originalAmountRef.current = amountData?.PlainText.Amount ?? 0}
        onBlur={(e) => handleBlur(e.target.value)}
      />
    </div>
  );
} 