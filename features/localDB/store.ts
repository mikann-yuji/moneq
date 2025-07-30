import { create } from 'zustand';
import Dexie, { Table } from 'dexie';

interface Expense {
  id: string,
  plainText: string,
  date: Date,
}

class LocalDB extends Dexie {
  expenses!: Table<Expense>;

  constructor() {
    super('myAppDatabase');
    this.version(1).stores({
      expenses: 'id, date',
    });
  }
}

interface LocalDBState {
  localDB: LocalDB;
}

const localDB = new LocalDB();

export const useLocalDBStore = create<LocalDBState>(() => ({
  localDB
}));