'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, where, query } from 'firebase/firestore';
import Link from 'next/link';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { useDek } from '@/context/DekContext';
import { DetailType } from '@/types/expenseType';
import { useExpenseCategory } from '@/context/ExpenseCategoryContext';
import { useExpenseBudget } from '@/context/ExpenseBudgetContext';

export default function InputPage() {
  const [amount, setAmount] = useState<number | string>('');
  const [category, setCategory] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [now, setNow] = useState(new Date());
  const [totalExpenseBudget, setTotalExpenseBudget] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [totalCategoryExpense, setTotalCategoryExpense] = useState<{ [key: string]: number }>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { sortedExpenseCategories } = useExpenseCategory();
  const { setDetailDataArray, expenseDatas, setExpenseData, getExpenseData, getAndSetExpenseData } = useExpense();
  const { expenseBudgetDatas } = useExpenseBudget();
  const { user } = useAuth();
  const { dek } = useDek();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const expenseQ = query(
      collection(db, 'Expenses'),
      where('Date', '>=', startDate),
      where('Date', '<=', endDate),
      where('UserId', '==', user?.uid || '')
    );

    if (dek) {
      getAndSetExpenseData(expenseQ, dek);
    }
  }, [dek]);

  useEffect(() => {
    setTotalExpenseBudget(
      sortedExpenseCategories.reduce((sum, category) => {
        return sum + (expenseBudgetDatas[category]?.amount || 0)
      }, 0)
    );
    sortedExpenseCategories.forEach(category => {
      const total = days.reduce((sum, day) => {
        const pKey = `${now.getFullYear()}-${now.getMonth() + 1}-${day}_${category}`;
        return sum + (expenseDatas[pKey]?.amount || 0);
      }, 0);
      setTotalCategoryExpense(prev => ({...prev, [category]: total}));
    });
  }, [expenseBudgetDatas, expenseDatas]);

  useEffect(() => {
    const allTotal = Object.values(totalCategoryExpense).reduce((total, value) => total + value, 0);
    setTotalExpense(allTotal);
  }, [totalCategoryExpense]);

  useEffect(() => {
    const updateAtMidnight = () => {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const previousDay = now.getDate();
      const previousMonth = now.getMonth();
      const previousYear = now.getFullYear();
      
      // 日付が変わった場合のみ更新
      if (currentDay !== previousDay || 
          currentMonth !== previousMonth || 
          currentYear !== previousYear) {
        setNow(currentDate);
      }
    };

    // 初回実行
    updateAtMidnight();

    // 1分ごとにチェック
    const interval = setInterval(updateAtMidnight, 60000);

    return () => clearInterval(interval);
  }, [now]);

  const handleSubmit = async () => {
    if (!category || amount === 0) {
      setErrorMessage('カテゴリと金額を入力してください');
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dayValue = now.getDate();
    const pKey = `${year}-${month}-${dayValue}_${category}`;
    
    const q = query(
      collection(db, 'Expenses'),
      where('Date', '==', new Date(year, month - 1, dayValue)),
      where('UserId', '==', user?.uid || '')
    );
    if (dek) {
      const dataArray = await getExpenseData(q, dek);
      const data = dataArray.find(x => x.decryptedData.Category == category);
      const docId = data?.docId || '';
      const amountNumber = Number(amount);
      const totalAmount = amountNumber + (data?.decryptedData.Amount || 0);
      const detailArray: DetailType[] = [
        ...(data?.decryptedData.Details?.map(x => ({
          amount: x.Amount,
          memo: x.Memo,
          time: x.Time
        })) || []),
        {
          amount: amountNumber,
          memo: memo,
          time: new Date()
        }
      ];
    
      setExpenseData(docId, pKey, totalAmount);
      setDetailDataArray(pKey, detailArray);
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
            <h1 className="text-3xl font-bold flex-1 text-center">当日入力</h1>
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
                  {category}の予算 {expenseBudgetDatas[category]?.amount || 0} - 
                  {category}の合計 {totalCategoryExpense[category]} = 
                  残 <span className="text-lg font-bold">{(expenseBudgetDatas[category]?.amount || 0) - totalCategoryExpense[category]}</span>
                </div>
                <div>{category}について残りの日数で一日当たりに使える金額</div>
                <div className="text-xl font-bold">
                  ￥{Math.floor(((expenseBudgetDatas[category]?.amount || 0) - totalCategoryExpense[category]) / (daysInMonth - now.getDate()))}
                </div>
              </div>
            )
          }
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="mt-4">
            <select 
              className="border rounded p-2 w-full" 
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">カテゴリを選択</option>
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