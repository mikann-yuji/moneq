import { PrimaryKeyType } from "@/constants/primaryKey";

export function changePrimaryKey(date: Date, category: string | null, primaryKeyType: PrimaryKeyType): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  switch (primaryKeyType) {
    case PrimaryKeyType.DAY:
      return `${year}-${month}-${day}_${category}`;
    case PrimaryKeyType.MONTH:
      return `${year}-${month}_${category}`;
    case PrimaryKeyType.WITHOUTCATEGORY:
      return `${year}-${month}-${day}`;
  }
}

export function pKeyToDateAndCategory(pKey: string): [Date, string] {
  const [dateString, category] = pKey.split('_');
  const [year, month, day] = dateString.split('-').map(Number);
  return [new Date(year, month - 1, (day || 1)), category];
}