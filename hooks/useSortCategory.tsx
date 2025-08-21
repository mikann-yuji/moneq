import { useLocalDBStore } from "@/localDB/store";
import { CollectionNames } from "@/localDB/type";
import { useEffect, useState } from "react";

export function useSortCategory<
  K extends CollectionNames.ExpenseCategory
  | CollectionNames.FixedCostCategory
  | CollectionNames.IncomeCategory
>(
  collectionName: K,
  addtionalCategories?: string[]
) {
  const [sortedCategory, setSortedCategory] = useState<string[]>([]);
  const categoryCollection = useLocalDBStore(state => state.collections[collectionName]);

  useEffect(() => {
    if (categoryCollection[0]?.PlainText) {
      setSortedCategory(categoryCollection[0]?.PlainText
        .sort((a, b) => a.OrderNo - b.OrderNo).map(x => x.Category));
    }
  }, [categoryCollection]);

  if (addtionalCategories) {
    return [...sortedCategory, ...addtionalCategories];
  } else {
    return sortedCategory;
  }
}