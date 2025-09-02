import { useComStore } from "./store";
import { User } from "firebase/auth";
import { useAuth } from "../auth/hooks";
import { localDB } from "@/localDB";
import { importDek } from "@/utils/crypto";
import { useLocalDB } from "@/localDB/hooks";
import { collection, query, where } from "firebase/firestore";
import { CollectionNames } from "@/localDB/type";
import { firestore } from "@/lib/firebase";
import { useLocalDBStore } from "@/localDB/store";

export const useCom = () => {
  const { setUser, setDek } = useAuth();
  const { clearCollection } = useLocalDBStore();
  const { syncFromFirestore } = useLocalDB();
  const { 
    isInitLoading, 
    setIsInitLoading,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
  } = useComStore();

  type ExcludedCollections =
    | CollectionNames.Expenses
    | CollectionNames.FixedCosts
    | CollectionNames.Incomes
    | CollectionNames.Memos;

  const categoryAndBudgetCollections: Exclude<CollectionNames, ExcludedCollections>[] =
    (Object.values(CollectionNames) as CollectionNames[]).filter(
      (name): name is Exclude<CollectionNames, ExcludedCollections> =>
        ![
          CollectionNames.Expenses,
          CollectionNames.FixedCosts,
          CollectionNames.Incomes,
          CollectionNames.Memos,
        ].includes(name)
    );

  const createQuery = (uid: string, collectionName: CollectionNames) => {
    return query(
      collection(firestore, collectionName),
      where('UserId', '==', uid)
    );
  }

  const loadUserInfo = async (user: User | null, signOutCallBack: () => void) => {
    if (user) {
      setUser(user);
      const rawDEK = await localDB.Dek.get('dek');
      if (rawDEK) {
        const dek = await importDek(rawDEK.Dek);
        setDek(dek);
        // カテゴリーと予算の同期
        for (const categoryAndBudgetCollection of categoryAndBudgetCollections) {
          syncFromFirestore(
            createQuery(user.uid, categoryAndBudgetCollection), 
            dek, categoryAndBudgetCollection
          );
        }
      } else {
        clearCollection();
        localDB.tables.map(t => t.clear());
        signOutCallBack();
      }
    } else {
      setDek(undefined);
      clearCollection();
      localDB.tables.map(t => t.clear());
      signOutCallBack();
    }
  }

  const createDateWithDay = (day: number) => {
    return new Date(selectedYear, selectedMonth - 1, day);
  }

  const createDateWithoutDay = () => {
    return new Date(selectedYear, selectedMonth - 1);
  }

  const createPrevMonthDateWithoutDay = () => {
    return new Date(selectedYear, selectedMonth - 2);
  }

  return {
    loadUserInfo,
    isInitLoading,
    setIsInitLoading,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    createDateWithDay,
    createDateWithoutDay,
    createPrevMonthDateWithoutDay
  }
}