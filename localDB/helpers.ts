import { firestore } from "@/lib/firebase";
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { localDB } from ".";
import { transformers } from "./transformer";
import { CollectionMap, CollectionNames } from "./type";

// 5秒ごとのfirestore同期用関数のid
let syncIntervalId: NodeJS.Timeout | null = null;

export function mergeById<T extends { id: string }>(prev: T[], next: T[]): T[] {
  const map = new Map(prev.map(item => [item.id, item]));

  for (const item of next) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

async function uploadItem<K extends keyof CollectionMap>(
  collectionName: K,
  item: CollectionMap[K],
  dek: CryptoKey,
  user: User
) {
  const encryptedItem = await transformers[collectionName].encrypt(item, dek, user);
  await setDoc(doc(firestore, collectionName, item.id), encryptedItem, { merge: true });
}

const syncToFirestore = async (
  dek: CryptoKey,
  user: User,
) => {
  let hasUnsynced = false;

  const collectionNames = Object.values(CollectionNames) as (keyof CollectionMap)[];
  for (const collectionName of collectionNames) {
    const table = localDB.table<CollectionMap[typeof collectionName], string>(collectionName);

    // 未同期データ取得
    const unsynced = await table.filter(item => item.Synced == false).toArray();

    if (unsynced.length > 0) {
      hasUnsynced = true;

      // Firestoreにアップロード
      for (const item of unsynced) {
        await uploadItem(collectionName, item, dek, user);
        await table.update(item.id, { Synced: true } as Partial<CollectionMap[typeof collectionName]>);
      }
    }
  }

  // 未同期がないなら同期ループ停止
  if (!hasUnsynced && syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log("同期ループ終了");
  }
}

export const startSyncLoop = async (dek: CryptoKey, user: User) => {
  // すでに動いていたら再起動しない
  if (syncIntervalId) {
    console.log("同期ループはすでに実行中");
    return;
  }

  await syncToFirestore(dek, user)

  syncIntervalId = setInterval(() => syncToFirestore(dek, user), 5000);
  console.log("同期ループ開始");
}