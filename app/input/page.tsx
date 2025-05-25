'use client';
import { useState } from 'react';
import { categories } from '@/constants/category';
import { db } from '@/lib/firebase';
import { getDoc,setDoc, doc, collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function InputPage() {
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async () => {
    if (!category || amount === 0) {
      setErrorMessage('カテゴリと金額を入力してください');
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dayValue = now.getDate();
    const docId = `${year}-${month}-${dayValue}_${category}`;
    const docRef = doc(db, 'Expenses', docId);

    const docSnap = await getDoc(docRef);
    let totalAmount = amount;
    if (docSnap.exists()) {
      const data = docSnap.data();
      totalAmount += data.Amount || 0;
    }

    await setDoc(docRef, {
      Date: new Date(year, month - 1, dayValue),
      Category: category,
      Amount: totalAmount,
      UpdatedAt: new Date()
    }, { merge: true });

    const detailsRef = collection(db, 'Expenses', docId, 'Details');
    await addDoc(detailsRef, {
      Amount: amount,
      Memo: memo,
      Date: new Date(),
    });

    setErrorMessage('');
    setCategory('');
    setAmount(0);
    setMemo('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6  max-w-[500px] mx-auto">
        <div
          className="rounded-lg p-4 md:p-8 text-center"
        >
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="mt-4">
            <select 
              className="border rounded p-2 w-full" 
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">カテゴリを選択</option>
              {categories.map(category => (
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
              onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : 0)}
              value={amount}
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
            <button 
              className="ml-4 bg-gray-300 text-black px-4 py-2 rounded cursor-pointer hover:bg-gray-400 text-sm md:text-base">
              <Link href="/">
                トップページに戻る
              </Link>
            </button>
          </p>
        </div>
      </div>
    </div> 
  );
} 