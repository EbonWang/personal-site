import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Profile, SocialLink } from "../../lib/types";
import { api } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { Button, Input, Textarea, Field, Card } from "../../lib/ui";

export default function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [bio, setBio] = useState(profile.bio);
  const [links, setLinks] = useState<SocialLink[]>(profile.social_links || []);
  const [saving, setSaving] = useState(false);

  const setLink = (i: number, key: keyof SocialLink, val: string) =>
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ name, title, avatar_url: avatarUrl, bio, social_links: links });
      toast("个人介绍已保存", "success");
      onSaved();
    } catch {
      toast("保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-5 p-6">
      <Field label="姓名">
        <Input value={name} onChange={setName} placeholder="你的名字" />
      </Field>
      <Field label="头衔 / 标语">
        <Input value={title} onChange={setTitle} placeholder="如：全栈工程师 · 创意开发者" />
      </Field>
      <Field label="头像图片 URL">
        <Input value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." />
      </Field>
      <Field label="个人简介">
        <Textarea value={bio} onChange={setBio} rows={4} placeholder="一句话介绍自己" />
      </Field>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">社交链接</span>
          <button
            type="button"
            onClick={() => setLinks((p) => [...p, { label: "", url: "" }])}
            className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:underline cursor-pointer"
          >
            <Plus size={13} /> 添加
          </button>
        </div>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <Input value={l.label} onChange={(v) => setLink(i, "label", v)} placeholder="名称（如 GitHub）" className="w-32" />
              <Input value={l.url} onChange={(v) => setLink(i, "url", v)} placeholder="https://..." />
              <button
                type="button"
                onClick={() => setLinks((p) => p.filter((_, idx) => idx !== i))}
                className="grid w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-rose-300 hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Button onClick={save} disabled={saving}>
        {saving ? "保存中…" : "保存修改"}
      </Button>
    </Card>
  );
}
