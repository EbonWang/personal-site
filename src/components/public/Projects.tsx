import { ExternalLink, Github } from "lucide-react";
import type { Project } from "../../lib/types";
import { Reveal, Card } from "../../lib/ui";

export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <h2 className="mb-2 text-center text-3xl font-bold">
          <span className="bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent">
            项目展示
          </span>
        </h2>
        <p className="mb-10 text-center text-sm text-slate-400">我做过的一些有趣产品</p>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <Card className="group overflow-hidden transition-transform duration-300 hover:-translate-y-1.5">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={p.image_url || "https://placehold.co/800x500/1E293B/6366F1?text=Project"}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{p.description}</p>
                {p.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {p.project_url && (
                    <a
                      href={p.project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-violet/20 px-3 py-1.5 text-xs text-violet-200 transition hover:bg-brand-violet/30"
                    >
                      <ExternalLink size={13} /> 演示
                    </a>
                  )}
                  {p.repo_url && (
                    <a
                      href={p.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
                    >
                      <Github size={13} /> 源码
                    </a>
                  )}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
