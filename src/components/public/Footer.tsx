import { GradientText } from "../../lib/ui";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/5 bg-ink-900/60 px-4 py-8 text-center sm:px-6">
      <p className="text-sm text-slate-500">
        © {year} <GradientText>个人作品集</GradientText> · 使用 Cloudflare Pages 构建
      </p>
    </footer>
  );
}
