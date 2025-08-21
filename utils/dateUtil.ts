export function dateToYMD(date: Date) {
  const tmp = date;
  tmp.setHours(0, 0, 0, 0);
  return tmp;
}