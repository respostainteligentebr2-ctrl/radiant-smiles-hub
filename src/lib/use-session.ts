import { useEffect, useState } from "react";
import { ensureSeed, getSession, type User } from "./store";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeed();
    setUser(getSession());
    setReady(true);
    const handler = () => setUser(getSession());
    window.addEventListener("dcr-store-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("dcr-store-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { user, ready };
}
