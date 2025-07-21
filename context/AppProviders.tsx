'use client';

import { ExpenseProvider } from "@/context/ExpenseContext";
import { AuthProvider } from "@/context/AuthContext";
import { DekProvider } from "@/context/DekContext";
import { ExpenseCategoryProvider } from "@/context/ExpenseCategoryContext";
import { FixedCostCategoryProvider } from "@/context/FixedCostCategoryContext";
import { IncomeCategoryProvider } from "@/context/IncomeCategoryContext";
import { FixedCostProvider } from "@/context/FixedCostContext";
import { IncomeProvider } from "@/context/IncomeContext";
import { ExpenseBudgetProvider } from "@/context/ExpenseBudgetContext";
import { FixedCostBudgetProvider } from "@/context/FixedCostBudgetContext";
import { IncomeBudgetProvider } from "@/context/IncomeBudgetContext";
import { MemoProvider } from "@/context/MemoContext";
import { LokiProvider } from "@/context/LokiContext";
import { pipeComponents } from "@/utils/pipeComponents";


export const AppProviders = pipeComponents(
  DekProvider,
  AuthProvider,
  LokiProvider,
  ExpenseProvider,
  ExpenseCategoryProvider,
  FixedCostCategoryProvider,
  IncomeCategoryProvider,
  FixedCostProvider,
  IncomeProvider,
  ExpenseBudgetProvider,
  FixedCostBudgetProvider,
  IncomeBudgetProvider,
  MemoProvider
)
