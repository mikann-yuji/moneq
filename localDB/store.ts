import { create } from 'zustand';
import { CollectionMap, CollectionNames } from './type';

interface LocalDBState {
  /**
   * firestore, dexie, zustand共通のコレクション名
   */
  collections: {
    [K in keyof CollectionMap]: CollectionMap[K][];
  };
  setCollection: <K extends keyof CollectionMap>(
    collectionName: K,
    updater: (prev: CollectionMap[K][]) => CollectionMap[K][],
  ) => void;
  clearCollection: () => void;
}

const initialCollections: LocalDBState['collections'] = {
  [CollectionNames.Expenses]:           [],
  [CollectionNames.FixedCosts]:         [],
  [CollectionNames.Incomes]:            [],
  [CollectionNames.ExpenseBudgets]:     [],
  [CollectionNames.FixedCostBudgets]:   [],
  [CollectionNames.IncomeBudgets]:      [],
  [CollectionNames.ExpenseCategory]:    [],
  [CollectionNames.FixedCostCategory]:  [],
  [CollectionNames.IncomeCategory]:     [],
  [CollectionNames.Memos]:              [],
};

export const useLocalDBStore = create<LocalDBState>((set) => ({
  collections: initialCollections,
  setCollection: (collectionName, updater) => {
    set((state) => ({
      collections: {
        ...state.collections,
        [collectionName]: updater(state.collections[collectionName]),
      },
    }));
  },
  clearCollection: () => {
    set({ collections: initialCollections });
  }
}));