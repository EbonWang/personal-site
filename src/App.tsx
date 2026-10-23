import { Routes, Route, Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import { useAuth } from "./lib/auth";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 text-slate-300">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  if (authed === null) return <FullScreenLoader />;
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
