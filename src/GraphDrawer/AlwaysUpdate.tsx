import { useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";

function AlwaysUpdate() {
  const {useDrawable} = useContext(DrawerContext);
  useDrawable(({drawerContext: {getFocus, setFocus}}) => {
    const focus = getFocus();
    setFocus(Vector2.NaV);
    setFocus(focus);
  }, -Infinity);
  return null;
}

export default AlwaysUpdate;