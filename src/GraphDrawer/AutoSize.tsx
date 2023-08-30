import { useContext, useEffect } from "react";
import DrawerContext from "./DrawerContext";

const AutoSize = () => {
  const drawerContext = useContext(DrawerContext);
  useEffect(() => {
    const canvas = drawerContext.canvasRenderingContext2D?.canvas;
    if (canvas) {
      const onResize = () => {
        drawerContext.setSize([canvas.clientWidth, canvas.clientHeight]);
      };
      onResize();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, [drawerContext]);
  return null;
};

export default AutoSize;
