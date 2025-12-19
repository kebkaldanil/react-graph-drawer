import { useState } from "react";

export const useUpdate = () => {
  const [, s] = useState(0);
  return () => s(p => p + 1 & 0xffff);
};
