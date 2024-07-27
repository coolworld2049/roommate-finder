const dateToString = (date: Date): string =>
  [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("-");

export const dobToAge = (dobString: string): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const todayDate = new Date(dateToString(now));
  const birthDate = new Date(dobString);

  const yearsOld = currentYear - birthDate.getFullYear();

  birthDate.setFullYear(currentYear);

  return Math.max(birthDate > todayDate ? yearsOld - 1 : yearsOld, 0);
};

export function numberWithSpaces(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
