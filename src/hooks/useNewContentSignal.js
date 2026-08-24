import { useEffect, useState } from "react";
import { NEW_CONTENT_EVENT } from "../utils/feedSignals";

/**
 * true ketika ada bite baru masuk lewat realtime dan belum di-refresh.
 * Dipakai oleh MobileNav/SideBar untuk menampilkan bullet di icon Search.
 */
export default function useNewContentSignal() {
  const [hasNewContent, setHasNewContent] = useState(false);

  useEffect(() => {
    const handler = (event) => setHasNewContent(!event.detail?.cleared);

    window.addEventListener(NEW_CONTENT_EVENT, handler);
    return () => window.removeEventListener(NEW_CONTENT_EVENT, handler);
  }, []);

  return hasNewContent;
}
