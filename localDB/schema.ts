import Dexie, { Table } from 'dexie';
import { Expense } from './model/expense';
import { Dek } from './model/dek';
import { FixedCost } from './model/fixedCost';
import { Income } from './model/income';
import { ExpenseBudget } from './model/expenseBudget';
import { FixedCostBudget } from './model/fixedCostBudget';
import { IncomeBudget } from './model/incomeBudget';
import { ExpenseCategory } from './model/expenseCategory';
import { FixedCostCategory } from './model/fixedCostCategory';
import { IncomeCategory } from './model/incomeCategory';
import { Memo } from './model/memo';

const isDev = process.env.NODE_ENV === 'development';

export class LocalDB extends Dexie {
  Dek!: Table<Dek>;
  Expenses!: Table<Expense>;
  FixedCosts!: Table<FixedCost>;
  Incomes!: Table<Income>;
  ExpenseBudgets!: Table<ExpenseBudget>;
  FixedCostBudgets!: Table<FixedCostBudget>;
  IncomeBudgets!: Table<IncomeBudget>;
  ExpenseCategory!: Table<ExpenseCategory>;
  FixedCostCategory!: Table<FixedCostCategory>;
  IncomeCategory!: Table<IncomeCategory>;
  Memos!: Table<Memo>;

  constructor() {
    super('myAppDatabase');

    this.setupSchema();
  }

  async init() {
    // if (isDev) {
    //   try {
    //     await this.delete();        // 既存DBを丸ごと削除
    //     console.log('🧹 DB reset (dev only)');
    //     this.setupSchema();          // 新しいスキーマで再作成
    //   } catch (error) {
    //     console.error('DB reset failed:', error);
    //   }
    // }
    await this.open();               // DBを開く（これで "has been closed" を回避）
  }

  private setupSchema() {
    this.version(1).stores({
      Dek: 'id',
      Expenses: 'id, Date, Synced',
      FixedCosts: 'id, Date, Synced',
      Incomes: 'id, Date, Synced',
      ExpenseBudgets: 'id, Synced',
      FixedCostBudgets: 'id, Synced',
      IncomeBudgets: 'id, Synced',
      ExpenseCategory: 'id, Synced',
      FixedCostCategory: 'id, Synced',
      IncomeCategory: 'id, Synced',
      Memos: 'id, Date, Synced',
    });
  }
}