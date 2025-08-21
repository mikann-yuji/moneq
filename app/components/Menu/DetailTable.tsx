'use client';

import { CollectionNames } from '@/localDB/type';
import { useCom } from '@/features/com/hooks';
import { format } from 'date-fns';
import { useLocalDBStore } from '@/localDB/store';
import { useLocalDB } from '@/localDB/hooks';
import { useAuth } from '@/features/auth/hooks';
import { useRouter } from 'next/navigation';
import { Expense } from '@/localDB/model/expense';

interface DetailTableProps {
  category: string;
  day: number;
}

export default function DetailTable({ category, day }: DetailTableProps) {
  const { createDateWithDay } = useCom();
  const { dek, user } = useAuth();
  const { putCollection } = useLocalDB();
  const router = useRouter();

  const expenseData = useLocalDBStore(state => state.collections[CollectionNames.Expenses].find(item => (
    item.PlainText.Category === category && item.Date.getTime() == createDateWithDay(day).getTime()
  )));
  const details = expenseData?.PlainText.Details;

  const handleDelete = (idx: number) => {
    const tmpList = details;
    if (tmpList) {
      const detailAmount = tmpList[idx].Amount;
      tmpList.splice(idx, 1);

      if (dek && user) {
        const updateData: Expense = {
          ...expenseData,
          PlainText: {
            ...expenseData.PlainText,
            Amount: expenseData.PlainText.Amount - detailAmount,
            Details: tmpList
          },
          Synced: false,
        }
        putCollection(CollectionNames.Expenses, updateData, dek, user, true);
      } else {
        router.push("/signin");
      }
    }
  }

  return (
    <div className="mt-2">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-1 py-1 text-sm text-center">日付</th>
            <th className="px-1 py-1 text-sm text-center">金額</th>
            <th className="px-1 py-1 text-sm text-center">メモ</th>
          </tr>
        </thead>
        <tbody>
          {details?.map((detail, idx) => (
            <tr key={`${category}_${day}_${idx}`}>
              <td className="px-1 py-1 text-sm text-center">{format(detail.Time, 'H:mm')}</td>
              <td className="px-1 py-1 text-sm text-center">{detail.Amount}</td>
              <td className="px-1 py-1 text-sm text-center">{detail.Memo}</td>
              <td>
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer"
                 onClick={() => handleDelete(idx)} // ← 削除処理を追加したい場合
              >
                {/* SVGのバツアイコン */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 