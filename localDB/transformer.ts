import { arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8Array, decryptData, encryptData, uint8ArrayToBase64 } from "@/utils/crypto";
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { CollectionMap, ComFirestoreType, KeysToOmitForCollection } from "./type";
import { User } from "firebase/auth";

type DecryptFn<T> = (
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
  dek: CryptoKey
) => Promise<T>;

type EncryptFn<T> = (
  data: T,
  dek: CryptoKey,
  user: User,
) => Promise<Omit<T, KeysToOmitForCollection> & ComFirestoreType>;

interface TransformerPair<T> {
  decrypt: DecryptFn<T>;
  encrypt: EncryptFn<T>;
}

export const transformers: {
  [K in keyof CollectionMap]: TransformerPair<CollectionMap[K]>
} = {
  Expenses: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['Expenses'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['Expenses']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        Date: (data.Date as any).toDate(),
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        Date: data.Date,
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      };
    }
  },
  FixedCosts: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['FixedCosts'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['FixedCosts']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        Date: (data.Date as any).toDate(),
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        Date: data.Date,
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
  Incomes: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['Incomes'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['Incomes']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        Date: (data.Date as any).toDate(),
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        Date: data.Date,
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
  ExpenseBudgets: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['ExpenseBudgets'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['ExpenseBudgets']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
  FixedCostBudgets: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['FixedCostBudgets'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['FixedCostBudgets']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
  IncomeBudgets: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['IncomeBudgets'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['IncomeBudgets']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
  ExpenseCategory: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['ExpenseCategory'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['ExpenseCategory']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
  FixedCostCategory: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['FixedCostCategory'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['FixedCostCategory']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
  IncomeCategory: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['IncomeCategory'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['IncomeCategory']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
  Memos: {
    decrypt: async (doc, dek) => {
      const data = doc.data() as Omit<CollectionMap['Memos'], KeysToOmitForCollection> & ComFirestoreType;
      const PlainText = await decryptData<CollectionMap['Memos']['PlainText']>(
        base64ToArrayBuffer(data.EncryptedData), 
        dek,
        base64ToUint8Array(data.IV)
      );
      return {
        id: doc.id,
        PlainText,
        Date: (data.Date as any).toDate(),
        CreatedAt: (data.CreatedAt as any).toDate(),
        UpdatedAt: (data.UpdatedAt as any).toDate(),
        Synced: true,
      };
    },
    encrypt: async (data, dek, user) => {
      const { encrypted, iv } = await encryptData(data.PlainText, dek);
      return {
        UserId: user.uid,
        IV: uint8ArrayToBase64(iv),
        EncryptedData: arrayBufferToBase64(encrypted),
        Date: data.Date,
        CreatedAt: data.CreatedAt || new Date(),
        UpdatedAt: new Date(),
      }
    }
  },
};