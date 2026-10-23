import { Github, Mail, Globe, ArrowDown } from "lucide-react";
import type { Profile } from "../../lib/types";
import { GradientText } from "../../lib/ui";

const iconMap: Record<string, typeof Globe> = {
  GitHub: Github,
  github: Github,
  邮箱: Mail,
  Email: Mail,
  微博: Globe,
  Website: Globe,
};

export default function Hero({ profile }: { profile: Profile }) {
  return (
    <section id="about" className="relative px-4 pt-28 pb-16 sm:px-6">
      <div className="bg-aurora pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-cyan opacity-40 blur-2xl" />
          <img
            src={profile.avatar_url || "https://placehold.co/160x160/1E293B/8B5CF6?text=AV"}
            alt={profile.name}
            className="relative h-32 w-32 rounded-full border border-white/15 object-cover shadow-glow sm:h-40 sm:w-40"
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          <GradientText>{profile.name || "你的名字"}</GradientText>
        </h1>
        <p className="mt-3 text-lg text-slate-300 sm:text-xl">{profile.title}</p>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400">{profile.bio}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {profile.social_links.map((s) => {
            const Icon = iconMap[s.label] || Globe;
            return (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-brand-violet/50 hover:shadow-glow"
              >
                <Icon size={16} /> {s.label}
              </a>
            );
          })}
        </div>

        <a
          href="#skills"
          className="mt-12 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          向下滚动了解更多 <ArrowDown size={16} className="animate-float" />
        </a>
      </div>
    </section>
  );
}
