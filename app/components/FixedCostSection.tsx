'use client';
import { inputStyle } from '../styles/inputStyles';

export default function IncomeSection() {
  return (
    <div className="bg-white rounded-lg p-4 shadow h-fit">
      <h2 className="text-lg font-semibold mb-4">固定費</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">家賃</label>
          <input
            type="number"
            className={inputStyle}
            placeholder="¥"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">光熱費</label>
          <input
            type="number"
            className={inputStyle}
            placeholder="¥"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">通信費</label>
          <input
            type="number"
            className={inputStyle}
            placeholder="¥"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">保険料</label>
          <input
            type="number"
            className={inputStyle}
            placeholder="¥"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">その他</label>
          <input
            type="number"
            className={inputStyle}
            placeholder="¥"
          />
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">合計</span>
            <span className="font-bold">¥0</span>
          </div>
        </div>
      </div>
    </div>
  );
} 