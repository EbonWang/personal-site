import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Project } from "../../lib/types";
import { api } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { Button, Input, Textarea, Field, Card, Modal } from "../../lib/ui";

interface FormState {
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  repo_url: string;
  tags: string;
  order_index: number;
}

export default function ProjectsAdmin() {
  const { toast } = useToast();
  const [items, setItems] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    image_url: "",
    project_url: "",
    repo_url: "",
    tags: "",
    order_index: 0,
  });

  const load = () => api.getProjects().then(setItems).catch(() => toast("加载失败", "error"));
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => items.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", description: "", image_url: "", project_url: "", repo_url: "", tags: "", order_index: items.length + 1 });
    setOpen(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      image_url: p.image_url,
      project_url: p.project_url,
      repo_url: p.repo_url,
      tags: p.tags.join(", "),
      order_index: p.order_index,
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editing) await api.updateProject({ id: editing.id, ...payload });
      else await api.createProject(payload);
      toast("已保存", "success");
      setOpen(false);
      load();
    } catch {
      toast("保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("确定删除该项目？")) return;
    try {
      await api.deleteProject(id);
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
          <Input value={q} onChange={setQ} placeholder="搜索项目名称…" className="pl-9" />
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> 新增
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <Card key={p.id} className="flex items-center gap-3 p-4">
            <img
              src={p.image_url || "https://placehold.co/80x80/1E293B/6366F1?text=P"}
              alt={p.title}
              className="h-14 w-14 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{p.title}</div>
              <div className="truncate text-xs text-slate-500">{p.description}</div>
            </div>
            <button onClick={() => openEdit(p)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 cursor-pointer">
              <Pencil size={15} />
            </button>
            <button onClick={() => remove(p.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-rose-300 hover:bg-rose-500/10 cursor-pointer">
              <Trash2 size={15} />
            </button>
          </Card>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-500 sm:col-span-2">暂无数据</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "编辑项目" : "新增项目"}>
        <div className="space-y-4">
          <Field label="标题">
            <Input value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
          </Field>
          <Field label="描述">
            <Textarea value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} rows={3} />
          </Field>
          <Field label="封面图 URL">
            <Input value={form.image_url} onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} />
          </Field>
          <Field label="演示链接">
            <Input value={form.project_url} onChange={(v) => setForm((f) => ({ ...f, project_url: v }))} />
          </Field>
          <Field label="仓库链接">
            <Input value={form.repo_url} onChange={(v) => setForm((f) => ({ ...f, repo_url: v }))} />
          </Field>
          <Field label="标签（英文逗号分隔）">
            <Input value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} placeholder="React, Vite" />
          </Field>
          <Field label="排序权重">
            <Input type="number" value={String(form.order_index)} onChange={(v) => setForm((f) => ({ ...f, order_index: Number(v) || 0 }))} />
          </Field>
          <Button onClick={save} className="w-full">
            保存
          </Button>
        </div>
      </Modal>
    </div>
  );
}
