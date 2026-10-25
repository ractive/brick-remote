import { useEffect, useState } from "react";

export function useButtonActiveIndicator(): [boolean, () => void] {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (pressed) {
      const timeout = setTimeout(() => setPressed(false), 175);
      return () => clearTimeout(timeout);
    }
  }, [pressed]);

  return [pressed, () => setPressed(true)];
}
