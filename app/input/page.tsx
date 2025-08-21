'use client';

import { useAuth } from '@/features/auth/hooks';
import { useSortCategory } from '@/hooks/useSortCategory';
import { firestore } from '@/lib/firebase';
import { useLocalDB } from '@/localDB/hooks';
import { Expense } from '@/localDB/model/expense';
import { useLocalDBStore } from '@/localDB/store';
import { CollectionNames } from '@/localDB/type';
import { dateToYMD } from '@/utils/dateUtil';
import { collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InputPage() {
  const [selectDate, setSelectDate] = useState<Date>(dateToYMD(new Date()));
  const [amount, setAmount] = useState<number | string>('');
  const [category, setCategory] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [now, setNow] = useState(new Date());
  const [totalExpenseBudget, setTotalExpenseBudget] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [totalCategoryExpense, setTotalCategoryExpense] = useState<{ [key: string]: number }>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { user, dek } = useAuth();
  const { syncFromFirestore, putCollection, createDataWithID } = useLocalDB();

  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: lastDayOfMonth }, (_, i) => i + 1);
  const expenseBudgetDatas = useLocalDBStore(state => state.collections[CollectionNames.ExpenseBudgets]);
  const expenseDatas = useLocalDBStore(state => state.collections[CollectionNames.Expenses]);
  const router = useRouter();
  const sortedExpenseCategories = useSortCategory(CollectionNames.ExpenseCategory);

  useEffect(() => {
    const fetchData = async () => {
      if (dek && user) {
        const q = query(
          collection(firestore, 'Expenses'),
          where('Date', '==', selectDate),
          where('UserId', '==', user.uid)
        );
    
        await syncFromFirestore(q, dek, CollectionNames.Expenses);
      }
    }
    
    fetchData();
  }, [selectDate, dek, user]);

  useEffect(() => {
    setTotalExpenseBudget(
      sortedExpenseCategories.reduce((sum, category) => {
        return sum + (expenseBudgetDatas.find(item => (
          item.PlainText.Category == category))?.PlainText.Amount || 0)
      }, 0)
    );
    sortedExpenseCategories.forEach(category => {
      const total = days.reduce((sum, day) => {
        return sum + (expenseDatas.find(item => (
          item.PlainText.Category == category 
          && item.Date == new Date(selectDate.getFullYear(), selectDate.getMonth() - 1, day)
        ))?.PlainText.Amount || 0);
      }, 0);
      setTotalCategoryExpense(prev => ({...prev, [category]: total}));
    });
  }, [expenseBudgetDatas, expenseDatas]);

  useEffect(() => {
    const allTotal = Object.values(totalCategoryExpense).reduce((total, value) => total + value, 0);
    setTotalExpense(allTotal);
  }, [totalCategoryExpense]);

  useEffect(() => {
    const scheduleMidnightUpdate = () => {
      // mount時の日付
      const mountedDate = new Date();
  
      // 翌日0時のDateを作成
      const midnight = new Date(
        mountedDate.getFullYear(),
        mountedDate.getMonth(),
        mountedDate.getDate() + 1,
        0, 0, 0, 0
      );
  
      const msUntilMidnight = midnight.getTime() - mountedDate.getTime();
  
      const timeout = setTimeout(() => {
        setSelectDate(dateToYMD(new Date())); // 0時ちょうどに現在時刻をセット
        setNow(new Date());
        scheduleMidnightUpdate(); // 次の0時のために再スケジュール
      }, msUntilMidnight);
  
      return () => clearTimeout(timeout);
    };
  
    const cancel = scheduleMidnightUpdate();
  
    return () => {
      cancel?.(); // クリーンアップ（初期化中止）
    };
  }, []);

  const handleSubmit = async () => {
    if (!category || amount === 0) {
      setErrorMessage('カテゴリと金額を入力してください');
      return;
    }

    const expenseData = expenseDatas.find(item => (
      item.Date.getTime() === selectDate.getTime() 
      && item.PlainText.Category === category
    ));
    const amountNumber = Number(amount);
    const totalAmount = amountNumber + (expenseData?.PlainText.Amount || 0);
    if (dek && user) {
      if (expenseData) {
        const updateData: Expense = {
          ...expenseData,
          PlainText: {
            ...expenseData.PlainText,
            Amount: totalAmount,
            Details: [
              ...expenseData.PlainText.Details || [],
              {
                Amount: amountNumber,
                Memo: memo,
                Time: new Date()
              }
            ]
          },
          Synced: false
        }
        putCollection(CollectionNames.Expenses, updateData, dek, user, true);
      } else {
        const createData = createDataWithID(
          CollectionNames.Expenses,
          {
            PlainText: {
              Amount: totalAmount,
              Category: category,
              Details: [{
                Amount: amountNumber,
                Memo: memo,
                Time: new Date()
              }]
            },
            Date: selectDate,
            Synced: false
          }
        );
        putCollection(CollectionNames.Expenses, createData, dek, user, true);
      }
    } else {
      router.push("/signin");
    }

    setErrorMessage('');
    setCategory('');
    setAmount(0);
    setMemo('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6  max-w-[500px] mx-auto">
        <div className="rounded-lg p-4 md:p-8 text-center">
          <div className="flex items-center mb-4 relative">
            <Link href="/" className="absolute left-0 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold flex-1 text-center">入力</h1>
          </div>
          <div>
            変動費の予算 {totalExpenseBudget} - 
            変動費の合計 {totalExpense} = 
            残 <span className="text-lg font-bold">{totalExpenseBudget - totalExpense}</span>
          </div>
          {
            category && (
              <div>
                <div>
                  {category}の予算 {expenseBudgetDatas.find(item => item.PlainText.Category === category)?.PlainText.Amount || 0} - 
                  {category}の合計 {totalCategoryExpense[category] || 0} = 
                  残 <span className="text-lg font-bold">{
                    (expenseBudgetDatas.find(item => item.PlainText.Category === category)?.PlainText.Amount || 0) 
                    - (totalCategoryExpense[category] || 0)
                  }</span>
                </div>
                <div>{category}について残りの日数で一日当たりに使える金額</div>
                <div className="text-xl font-bold">
                  ￥{Math.floor(((
                    expenseBudgetDatas.find(item => item.PlainText.Category === category)?.PlainText.Amount || 0
                  ) - (totalCategoryExpense[category] || 0)) / (lastDayOfMonth - now.getDate() + 1))}
                </div>
              </div>
            )
          }
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="mt-4">
            <input
              type="date"
              className="border rounded p-2 w-full"
              id="day"
              value={selectDate.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
              }).replace(/\//g, "-")}
              onChange={(e) => {
                const dateStr = e.target.value;
                setSelectDate(dateToYMD(new Date(dateStr)));
              }}
            />
          </div>
          <div className="mt-4">
            <select 
              className="border rounded p-2 w-full" 
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>カテゴリを選択</option>
              {sortedExpenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <input
              type="number"
              placeholder="金額"
              className="border rounded p-2 w-full"
              id="amount"
              onChange={(e) => {
                const value = e.target.value.replace(/^0+/, '');
                setAmount(value);
              }}
              value={amount.toString()}
            />
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="メモ"
              className="border rounded p-2 w-full"
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
          <p className="text-gray-500 text-sm md:text-base mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 text-sm md:text-base"
              onClick={handleSubmit}
            >
              送信
            </button>
          </p>
        </div>
      </div>
    </div> 
  );
} 