'use client';

import { CollectionNames } from '@/localDB/type';
import { useCom } from '@/features/com/hooks';
import { format } from 'date-fns';
import { useLocalDBStore } from '@/localDB/store';

interface DetailTableProps {
  category: string;
  day: number;
}

export default function DetailTable({ category, day }: DetailTableProps) {
  const { createDateWithDay } = useCom();

  const details = useLocalDBStore(state => state.collections[CollectionNames.Expenses].find(item => (
    item.PlainText.Category === category && item.Date.getTime() == createDateWithDay(day).getTime()
  ))?.PlainText.Details);

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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 