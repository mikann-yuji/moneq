import Dexie, { Table } from 'dexie';
import { Expense } from './model/expense';

const isDev = process.env.NODE_ENV === 'development';

export class LocalDB extends Dexie {
  expenses!: Table<Expense>;

  constructor() {
    super('myAppDatabase');

    if (isDev) {
      this.delete().then(() => {
        console.log('🧹 DB reset (dev only)');
        this.setupSchema();
      });
    } else {
      this.setupSchema();
    }
  }

  private setupSchema() {
    this.version(1).stores({
      expenses: 'id, date, synced',
    });
  }
}