import { useState } from "react";
import { Download, KeyRound } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { Button, Input, Field, Card } from "../../lib/ui";

export default function SettingsAdmin() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const changePwd = async () => {
    if (password.length < 6) {
      toast("密码至少 6 位", "error");
      return;
    }
    setSaving(true);
    try {
      await api.changePassword(password);
      toast("密码已更新", "success");
      setPassword("");
    } catch {
      toast("修改失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `site-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("已导出", "success");
    } catch {
      toast("导出失败", "error");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-white">
          <KeyRound size={18} className="text-brand-violet" /> 修改管理员密码
        </div>
        <Field label="新密码（至少 6 位）">
          <Input type="password" value={password} onChange={setPassword} placeholder="输入新密码" />
        </Field>
        <Button onClick={changePwd} disabled={saving}>
          {saving ? "保存中…" : "更新密码"}
        </Button>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-white">
          <Download size={18} className="text-brand-cyan" /> 导出全站数据
        </div>
        <p className="text-sm text-slate-400">将个人介绍、技能、项目、博客导出为 JSON 文件，便于备份或迁移。</p>
        <Button variant="ghost" onClick={exportData}>
          <Download size={16} /> 导出 JSON
        </Button>
      </Card>
    </div>
  );
}
