export const interpolate = (data: ArrayLike<number>) => {
  return (x: number) => {
    if (x < 0 || x > data.length) {
      return NaN;
    }
    const i = Math.floor(x);
    if (i === x) {
      return data[i];
    }
    const k = x - i;
    return data[i] * (1 - k) + data[i + 1] * k;
  };
};
