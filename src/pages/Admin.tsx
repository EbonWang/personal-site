import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Sparkles, FolderGit2, BookText, Settings as SettingsIcon, LogOut } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import type { Profile } from "../lib/types";
import { GradientText, Button } from "../lib/ui";
import ProfileForm from "../components/admin/ProfileForm";
import SkillsAdmin from "../components/admin/SkillsAdmin";
import ProjectsAdmin from "../components/admin/ProjectsAdmin";
import BlogAdmin from "../components/admin/BlogAdmin";
import SettingsAdmin from "../components/admin/SettingsAdmin";

type Tab = "profile" | "skills" | "projects" | "blog" | "settings";

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "个人介绍", icon: User },
  { key: "skills", label: "技能", icon: Sparkles },
  { key: "projects", label: "项目", icon: FolderGit2 },
  { key: "blog", label: "博客", icon: BookText },
  { key: "settings", label: "设置", icon: SettingsIcon },
];

export default function Admin() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const doLogout = async () => {
    await logout();
    toast("已退出登录", "info");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ink-900 text-slate-200">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-ink-900/80 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            <GradientText>后台管理</GradientText>
          </span>
          {profile && <span className="hidden text-sm text-slate-500 sm:inline">· {profile.name}</span>}
        </div>
        <Button variant="ghost" onClick={doLogout}>
          <LogOut size={16} /> 退出
        </Button>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row">
        <aside className="shrink-0 md:w-44">
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-brand-indigo/30 to-brand-violet/20 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
            </div>
          ) : (
            <>
              {tab === "profile" && profile && <ProfileForm profile={profile} onSaved={() => api.getProfile().then(setProfile)} />}
              {tab === "skills" && <SkillsAdmin />}
              {tab === "projects" && <ProjectsAdmin />}
              {tab === "blog" && <BlogAdmin />}
              {tab === "settings" && <SettingsAdmin />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
