import type { Skill } from "../../lib/types";
import { Reveal, Card } from "../../lib/ui";

export default function Skills({ skills }: { skills: Skill[] }) {
  const groups = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const key = s.category || "其他";
    (acc[key] ||= []).push(s);
    return acc;
  }, {});

  return (
    <section id="skills" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Reveal>
        <h2 className="mb-2 text-center text-3xl font-bold">
          <span className="bg-gradient-to-r from-brand-indigo to-brand-cyan bg-clip-text text-transparent">
            技能展示
          </span>
        </h2>
        <p className="mb-10 text-center text-sm text-slate-400">我所掌握的技术栈与熟练度</p>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2">
        {Object.entries(groups).map(([cat, list], gi) => (
          <Reveal key={cat} delay={gi * 80}>
            <Card className="p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-cyan">{cat}</h3>
              <div className="space-y-4">
                {list.map((s) => (
                  <div key={s.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-slate-200">{s.name}</span>
                      <span className="text-slate-500">{s.level}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-indigo to-brand-violet transition-all duration-1000"
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
