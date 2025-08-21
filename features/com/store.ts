import { create } from 'zustand';

interface ComState {
  isInitLoading: boolean;
  setIsInitLoading: (isInitLoading: boolean) => void;
  selectedYear: number;
  setSelectedYear: (selectedYear: number) => void;
  selectedMonth: number;
  setSelectedMonth: (selectedMonth: number) => void;
}

export const useComStore = create<ComState>((set) => ({
  isInitLoading: true,
  setIsInitLoading: (isInitLoading) => {
    set({ isInitLoading });
  },
  selectedYear: new Date().getFullYear(),
  setSelectedYear: (selectedYear) => {
    set({ selectedYear });
  },
  selectedMonth: new Date().getMonth() + 1,
  setSelectedMonth: (selectedMonth) => {
    set({ selectedMonth });
  },
}));