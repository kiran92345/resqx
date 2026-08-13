import { useCallback, useEffect, useState } from "react";

/** Mobile sidebar drawer — locks body scroll while open. */
export function useMobileNav() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("nav-drawer-open");

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("nav-drawer-open");
    };
  }, [open, close]);

  return { open, close, toggle, setOpen };
}
