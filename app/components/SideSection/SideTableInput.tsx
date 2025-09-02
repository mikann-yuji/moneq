'use client';

import { useAuth } from '@/features/auth/hooks';
import { useCom } from '@/features/com/hooks';
import { useLocalDB } from '@/localDB/hooks';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionNames } from '@/localDB/type';
import { inputStyle } from '@/styles/inputStyles';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

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
  const { createDateWithoutDay, createPrevMonthDateWithoutDay } = useCom();
  const { user, dek } = useAuth();

  const router = useRouter();
  const originalAmountRef = useRef<number | null>(null);
  const fixedCostCategoryCollection = useLocalDBStore(state => state.collections[CollectionNames.FixedCostCategory]);
  const amountData = useLocalDBStore(state => state.collections[collectionName].find(item => (
    item.PlainText.Category === category && item.Date.getTime() == createDateWithoutDay().getTime()
  )));

  // 初回マウント時: 固定費カテゴリのCarryOverがtrueかつ当月データが未作成なら、前月の値を自動投入
  useEffect(() => {
    if (collectionName !== CollectionNames.FixedCosts) return;
    if (!dek || !user) return;
    if (amountData) return; // 既に当月データがある

    const carryOver = fixedCostCategoryCollection[0]?.PlainText.find(x => x.Category === category)?.CarryOver ?? false;
    if (!carryOver) return;

    const prevAmountData = useLocalDBStore.getState().collections[CollectionNames.FixedCosts].find(item => (
      item.PlainText.Category === category && item.Date.getTime() == createPrevMonthDateWithoutDay().getTime()
    ));

    const prevAmount = prevAmountData?.PlainText.Amount;
    if (prevAmount === undefined) return;

    const createData = createDataWithID<CollectionNames.FixedCosts>(
      collectionName,
      {
        PlainText: {
          Amount: prevAmount,
          Category: category,
        },
        Date: createDateWithoutDay(),
        Synced: false,
      }
    );
    putCollection(collectionName, createData, dek, user, true);
  }, [collectionName, category, dek, user, amountData]);

  const handleFixedCostCategoryChecked = (check: boolean) => {
    if (dek && user) {
      const updatedCategories = fixedCostCategoryCollection[0].PlainText.map(item => {
        if (item.Category === category) {
          return {
            ...item,
            CarryOver: check,
          }
        } else {
          return item;
        }
      });
      const updateData = {
        ...fixedCostCategoryCollection[0],
        PlainText: updatedCategories,
        Synced: false,
      }
      putCollection(CollectionNames.FixedCostCategory, updateData, dek, user, true);
    } else {
      router.push("/signin");
    }
  }

  const handleChange = (value: string) => {
    const amount = value ? parseInt(value) : 0;

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
      <div className="flex items-center">
        <label className="text-sm font-medium text-gray-700">{category}</label>
        {collectionName == CollectionNames.FixedCosts && (
          <>
            <input
              type="checkbox"
              className="rounded ml-1.5"
              checked={fixedCostCategoryCollection[0].PlainText.find(item => item.Category === category)?.CarryOver ?? false}
              onChange={(e) => handleFixedCostCategoryChecked(e.target.checked)}
            />
            <span className="text-xs text-blue-500">値を固定</span>
          </>
        )}
      </div>
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