import { useState } from "react";

export const useUpdate = () => {
  const [, s] = useState(true);
  return () => s(p => !p);
};