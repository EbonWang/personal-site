import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { BlogPost } from "../../lib/types";
import { api } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { Button, Input, Textarea, Field, Card, Modal } from "../../lib/ui";

interface FormState {
  title: string;
  summary: string;
  content: string;
  published_at: string;
}

function toDateInput(ts?: number): string {
  if (!ts) return new Date().toISOString().slice(0, 10);
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BlogAdmin() {
  const { toast } = useToast();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ title: "", summary: "", content: "", published_at: toDateInput() });

  const load = () =>
    api.getBlog().then((list) => setItems(list as BlogPost[])).catch(() => toast("加载失败", "error"));
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => items.filter((b) => b.title.toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", summary: "", content: "", published_at: toDateInput() });
    setOpen(true);
  };
  const openEdit = async (id: number) => {
    try {
      const full = await api.getBlogPost(id);
      setEditing(full);
      setForm({
        title: full.title,
        summary: full.summary,
        content: full.content,
        published_at: toDateInput(full.published_at),
      });
      setOpen(true);
    } catch {
      toast("加载失败", "error");
    }
  };

  const save = async () => {
    const payload = { ...form, published_at: new Date(form.published_at).getTime() };
    try {
      if (editing) await api.updateBlog({ id: editing.id, ...payload });
      else await api.createBlog(payload);
      toast("已保存", "success");
      setOpen(false);
      load();
    } catch {
      toast("保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("确定删除该文章？")) return;
    try {
      await api.deleteBlog(id);
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
          <Input value={q} onChange={setQ} placeholder="搜索文章标题…" className="pl-9" />
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> 写文章
        </Button>
      </div>

      <Card className="divide-y divide-white/5">
        {filtered.map((b) => (
          <div key={b.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{b.title}</div>
              <div className="truncate text-xs text-slate-500">{b.summary}</div>
            </div>
            <button onClick={() => openEdit(b.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 cursor-pointer">
              <Pencil size={15} />
            </button>
            <button onClick={() => remove(b.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-rose-300 hover:bg-rose-500/10 cursor-pointer">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">暂无文章</p>}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "编辑文章" : "写文章"}>
        <div className="space-y-4">
          <Field label="标题">
            <Input value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
          </Field>
          <Field label="摘要">
            <Input value={form.summary} onChange={(v) => setForm((f) => ({ ...f, summary: v }))} />
          </Field>
          <Field label="发布日期">
            <Input type="date" value={form.published_at} onChange={(v) => setForm((f) => ({ ...f, published_at: v }))} />
          </Field>
          <Field label="正文（纯文本）">
            <Textarea value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} rows={8} placeholder="在此输入文章正文…" />
          </Field>
          <Button onClick={save} className="w-full">
            保存
          </Button>
        </div>
      </Modal>
    </div>
  );
}
