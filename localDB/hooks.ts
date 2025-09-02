import { firestore } from "@/lib/firebase";
import { User } from "firebase/auth";
import { collection, doc, getDocs, Query } from "firebase/firestore";
import { localDB } from ".";
import { mergeById, startSyncLoop } from "./helpers";
import { useLocalDBStore } from "./store";
import { CollectionMap, CollectionNames } from "./type";
import { transformers } from "./transformer";

export const useLocalDB = () => {
  const { setCollection } = useLocalDBStore();

  async function syncFromFirestore<K extends keyof CollectionMap>(
    query: Query,
    dek: CryptoKey,
    collectionName: K,
  ) {
    // Firestoreからデータをフェッチ
    const querySnapshot = await getDocs(query);
    const dataArray = await Promise.all(
      querySnapshot.docs.map(async (doc) => 
        await transformers[collectionName].decrypt(doc, dek)
      )
    );
  
    // ローカルDBに一括保存
    const table = localDB.table<CollectionMap[K], string>(collectionName);
    await table.bulkPut(dataArray);
    const tableName = await table.toArray();
  
    // zustandを更新
    setCollection(collectionName, (prev) => mergeById(prev, tableName));
  }
  
  async function putCollection<
    K extends keyof CollectionMap,
  >(
    collectionName: K, 
    data: CollectionMap[K],
    dek: CryptoKey,
    user: User,
    sync: boolean = false,
  ) {
    // zustandを更新
    setCollection(collectionName, (prev) => mergeById(prev, [data]));

    if (sync) {
      // ローカルDBに保存
      try {
        const table = localDB.table<CollectionMap[K], string>(collectionName);
        void table.put(data);
      } catch (e) {
        console.log(e);
      }
      
      // Firestoreへの5秒ごとの同期を開始
      startSyncLoop(dek, user);
    }
  }

  function createDataWithID<K extends keyof CollectionMap>(
    collectionName: K, partial: Omit<CollectionMap[K], 'id'>
  ): CollectionMap[K] {
    return {
      id: doc(collection(firestore, collectionName)).id,
      ...partial,
    } as CollectionMap[K];
  }

  function createDataWithIDByBudget<
    K extends CollectionNames.ExpenseBudgets 
    | CollectionNames.FixedCostBudgets
    | CollectionNames.IncomeBudgets
  >(
    collectionName: K, partial: Omit<CollectionMap[K], 'id'>
  ): CollectionMap[K] {
    return {
      id: doc(collection(firestore, collectionName)).id,
      ...partial,
    } as CollectionMap[K];
  }

  async function createFirstCategories<
    K extends CollectionNames.ExpenseCategory
    | CollectionNames.FixedCostCategory
    | CollectionNames.IncomeCategory
  >(
    collectionName: K,
    dek: CryptoKey,
    user: User,
    categoriesStr: string[]
  ) {
    const data: CollectionMap[K] = {
      id: doc(collection(firestore, collectionName)).id,
      PlainText: categoriesStr.map((category, idx) => ({
        Category: category,
        OrderNo: idx + 1
      })),
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
      Synced: false,
    }
    await putCollection(collectionName, data, dek, user, true);
  }

  return {
    syncFromFirestore,
    putCollection,
    createDataWithID,
    createDataWithIDByBudget,
    createFirstCategories
  }
};