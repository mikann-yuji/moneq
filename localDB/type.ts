import { Expense } from "./model/expense"
import { ExpenseBudget } from "./model/expenseBudget"
import { ExpenseCategory } from "./model/expenseCategory"
import { FixedCost } from "./model/fixedCost"
import { FixedCostBudget } from "./model/fixedCostBudget"
import { FixedCostCategory } from "./model/fixedCostCategory"
import { Income } from "./model/income"
import { IncomeBudget } from "./model/incomeBudget"
import { IncomeCategory } from "./model/incomeCategory"
import { Memo } from "./model/memo"

export enum CollectionNames {
  Expenses =          'Expenses',
  FixedCosts =        'FixedCosts',
  Incomes =           'Incomes',
  ExpenseBudgets =    'ExpenseBudgets',
  FixedCostBudgets =  'FixedCostBudgets',
  IncomeBudgets =     'IncomeBudgets',
  ExpenseCategory =   'ExpenseCategory',
  FixedCostCategory = 'FixedCostCategory',
  IncomeCategory =    'IncomeCategory',
  Memos =             'Memos',
}

export type CollectionMap  = {
  [CollectionNames.Expenses]:           Expense,
  [CollectionNames.FixedCosts]:         FixedCost,
  [CollectionNames.Incomes]:            Income,
  [CollectionNames.ExpenseBudgets]:     ExpenseBudget,
  [CollectionNames.FixedCostBudgets]:   FixedCostBudget,
  [CollectionNames.IncomeBudgets]:      IncomeBudget,
  [CollectionNames.ExpenseCategory]:    ExpenseCategory,
  [CollectionNames.FixedCostCategory]:  FixedCostCategory,
  [CollectionNames.IncomeCategory]:     IncomeCategory,
  [CollectionNames.Memos]:              Memo,
}

export type ComLocalDBType = {
  id: string,
  CreatedAt?: Date,
  UpdatedAt?: Date,
  Synced: boolean,
}

export type ComFirestoreType = {
  UserId: string,
  IV: string,
  EncryptedData: string,
}

export type KeysToOmitForCollection = 'id' | 'PlainText' | 'Synced';