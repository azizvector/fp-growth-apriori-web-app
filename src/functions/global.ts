export const twoDecimalPlacesWithoutRound = (num: number): number => {
  if (num % 1 === 0) {
    return num;
  }
  const stringNum: string = num.toString();
  let finalNum: string = stringNum.slice(0, stringNum.indexOf('.') + 3);

  return Number(finalNum);
};

export const millisToSeconds = (millis: number): string => {
  const seconds = millis / 1000;
  return seconds.toFixed(3);
}