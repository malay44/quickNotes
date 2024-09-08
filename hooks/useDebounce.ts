import { useRef } from "react";

const useDebounce = (func: (...args: unknown[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (...args: unknown[]) => {
    clearTimeout(timeoutRef.current as NodeJS.Timeout);
    timeoutRef.current = setTimeout(() => func(...args), delay);
  };
};

export default useDebounce;
