import { useState } from "react";
import { Calendar, BookOpen } from "lucide-react";
import type { BlogListItem, BlogPost } from "../../lib/types";
import { api } from "../../lib/api";
import { Reveal, Card, Modal } from "../../lib/ui";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Blog({ posts }: { posts: BlogListItem[] }) {
  const [active, setActive] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);

  const open = async (id: number) => {
    setLoading(true);
    try {
      const post = await api.getBlogPost(id);
      setActive(post);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="blog" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Reveal>
        <h2 className="mb-2 text-center text-3xl font-bold">
          <span className="bg-gradient-to-r from-brand-cyan to-brand-indigo bg-clip-text text-transparent">
            博客文章
          </span>
        </h2>
        <p className="mb-10 text-center text-sm text-slate-400">记录开发与思考</p>
      </Reveal>

      <div className="space-y-4">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <Card className="cursor-pointer p-5 transition hover:border-brand-violet/40 hover:shadow-glow" onClick={() => open(p.id)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white transition group-hover:text-brand-violet">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.summary}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={13} /> {formatDate(p.published_at)}
                  </div>
                </div>
                <BookOpen size={20} className="mt-1 shrink-0 text-brand-violet/70" />
              </div>
            </Card>
          </Reveal>
        ))}
        {posts.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">暂无文章</p>
        )}
      </div>

      <Modal open={!!active || loading} onClose={() => setActive(null)} title={active?.title || "加载中…"}>
        {loading && <p className="text-sm text-slate-400">加载中…</p>}
        {active && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={13} /> {formatDate(active.published_at)}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{active.content}</p>
          </div>
        )}
      </Modal>
    </section>
  );
}
