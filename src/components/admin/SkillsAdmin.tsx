import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Skill } from "../../lib/types";
import { api } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { Button, Input, Field, Card, Modal } from "../../lib/ui";

export default function SkillsAdmin() {
  const { toast } = useToast();
  const [items, setItems] = useState<Skill[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Skill | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", level: 80, order_index: 0 });

  const load = () => api.getSkills().then(setItems).catch(() => toast("加载失败", "error"));
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => items.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", category: "", level: 80, order_index: items.length + 1 });
    setOpen(true);
  };
  const openEdit = (s: Skill) => {
    setEditing(s);
    setForm({ name: s.name, category: s.category, level: s.level, order_index: s.order_index });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) await api.updateSkill({ id: editing.id, ...form });
      else await api.createSkill(form);
      toast("已保存", "success");
      setOpen(false);
      load();
    } catch {
      toast("保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("确定删除该技能？")) return;
    try {
      await api.deleteSkill(id);
      toast("已删除", "success");
      load();
    } catch {
      toast("删除失败", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={q} onChange={setQ} placeholder="搜索技能名称…" className="pl-9" />
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> 新增
        </Button>
      </div>

      <Card className="divide-y divide-white/5">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{s.name}</div>
              <div className="text-xs text-slate-500">
                {s.category} · 熟练度 {s.level}% · 排序 {s.order_index}
              </div>
            </div>
            <button onClick={() => openEdit(s)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 cursor-pointer">
              <Pencil size={15} />
            </button>
            <button onClick={() => remove(s.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-rose-300 hover:bg-rose-500/10 cursor-pointer">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">暂无数据</p>}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "编辑技能" : "新增技能"}>
        <div className="space-y-4">
          <Field label="名称">
            <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="如 React" />
          </Field>
          <Field label="分类">
            <Input value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="如 前端" />
          </Field>
          <Field label={`熟练度（${form.level}%）`}>
            <Input
              type="number"
              value={String(form.level)}
              onChange={(v) => setForm((f) => ({ ...f, level: Number(v) || 0 }))}
            />
          </Field>
          <Field label="排序权重">
            <Input
              type="number"
              value={String(form.order_index)}
              onChange={(v) => setForm((f) => ({ ...f, order_index: Number(v) || 0 }))}
            />
          </Field>
          <Button onClick={save} className="w-full">
            保存
          </Button>
        </div>
      </Modal>
    </div>
  );
}
