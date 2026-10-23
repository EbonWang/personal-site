import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { Button, Input, Card, GradientText } from "../lib/ui";

export default function AdminLogin() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(password);
      toast("登录成功", "success");
      navigate("/admin");
    } catch (err) {
      toast("密码错误", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <Card className="relative w-full max-w-sm p-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
          <ArrowLeft size={14} /> 返回前台
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-r from-brand-indigo to-brand-violet text-white">
            <Lock size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold">
              <GradientText>后台管理</GradientText>
            </h1>
            <p className="text-xs text-slate-400">请输入管理员密码</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="管理员密码"
          />
          <Button type="submit" disabled={loading || !password} className="w-full">
            {loading ? "登录中…" : "登 录"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
