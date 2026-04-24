import { useState, useCallback } from "react";

export function useDialog<T = null>() {
  const [state, setState] = useState<{
    open: boolean;
    data: T | null;
  }>({ open: false, data: null });

  const open = useCallback((data: T | null = null) => {
    setState({ open: true, data });
  }, []);

  const close = useCallback(() => {
    setState({ open: false, data: null });
  }, []);

  const setOpen = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setState({ open: false, data: null });
    }
  }, []);

  return {
    isOpen: state.open,
    data: state.data,
    open,
    close,
    setOpen,
  };
}
