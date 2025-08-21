import { LocalDB } from "./schema";

export const localDB = new LocalDB();
export const initLocalDB = async () => {
  if (process.env.NODE_ENV === 'development') {
    await localDB.init();
  } else {
    await localDB.open();
  }
};