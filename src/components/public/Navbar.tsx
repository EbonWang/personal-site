import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X, LayoutDashboard } from "lucide-react";
import { useTheme } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import { GradientText } from "../../lib/ui";

const links = [
  { href: "#about", label: "关于" },
  { href: "#skills", label: "技能" },
  { href: "#projects", label: "项目" },
  { href: "#blog", label: "博客" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { authed } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-ink-900/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#about" className="flex items-center gap-2 text-lg font-bold">
          <GradientText>个人作品集</GradientText>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="切换主题"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to={authed ? "/admin" : "/login"}
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 md:flex"
          >
            <LayoutDashboard size={16} /> 后台
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 md:hidden cursor-pointer"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/5 bg-ink-900/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
              >
                {l.label}
              </a>
            ))}
            <Link
              to={authed ? "/admin" : "/login"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-brand-cyan"
            >
              进入后台
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
