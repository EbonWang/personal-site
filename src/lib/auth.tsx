import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api } from "./api";

interface AuthCtx {
  authed: boolean | null;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  authed: null,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await api.me();
      setAuthed(!!r.authed);
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (password: string) => {
    await api.login(password);
    setAuthed(true);
  };

  const logout = async () => {
    await api.logout();
    setAuthed(false);
  };

  return <Ctx.Provider value={{ authed, login, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
