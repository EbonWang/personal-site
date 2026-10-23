# AGENTS —— 智能体 / 开发者协作说明

本文件供 AI 智能体或协作者快速理解项目并安全地进行扩展与维护。

## 1. 项目定位

- 一个**静态前台 SPA + 无服务器 API + 边缘数据库**的个人作品集站点。
- 部署目标固定为 **Cloudflare Pages**（D1 + Pages Functions），不要擅自改为其他平台（除非同步改造 API 层）。
- 前台与后台共用同一份 React 构建产物（`dist/`），通过 HashRouter 区分路由：`/` 前台、`/#/login` 登录、`/#/admin` 后台。

## 2. 目录与职责（要点）

- `functions/lib/auth.ts`：**唯一**的鉴权与 HTTP 工具来源。任何新接口需要鉴权，都从这里导入 `verifySession`/`json`/`getCookie`，**不要**在新文件里重复实现。
- `functions/api/**`：每个文件导出一个或多个 `onRequestGet/onRequestPost/...` 函数，文件名即路由（`blog/[id].ts` → `/api/blog/:id`）。
- `src/lib/api.ts`：前端唯一的数据访问层。新增接口请在此集中声明。
- `src/lib/types.ts`：前后端共享的数据类型（Profile / Skill / Project / BlogPost）。
- `src/components/public/*`：前台展示组件；`src/components/admin/*`：后台管理组件。
- `migrations/0001_init.sql`：D1 建表。**新增表/字段必须新建 `0002_*.sql` 迁移**，不要直接改旧迁移（D1 迁移不可变）。

## 3. 通用约定（必读）

1. **SQL 一律参数化**：使用 `env.DB.prepare("... ? ...").bind(x).run()`，禁止字符串拼接。
2. **鉴权复用**：写接口第一行调用 `await verifySession(getCookie(request, "session"), env.SESSION_SECRET)`；未通过返回 `json({ error: "unauthorized" }, 401)`。
3. **JSON 字段**：`social_links`、`tags` 以字符串存库，出入库时 `JSON.stringify` / `JSON.parse`，并在 `try/catch` 中兜底为 `[]`。
4. **统一错误结构**：`{ "error": "code" }`；前端在 `src/lib/api.ts` 的 `req()` 中统一抛错，由调用处 `toast` 提示。
5. **密码安全**：哈希用 `hashPasswordWithSalt`（PBKDF2-SHA256 + 随机 salt）；登录优先比对 `admin` 表，无记录回退环境变量 `ADMIN_PASSWORD`。

## 4. 常见任务清单

### 4.1 新增一个内容模块（如「友链」）
1. 建迁移 `migrations/0002_links.sql`：`CREATE TABLE links (...)`。
2. `functions/api/links.ts`：复制 `skills.ts` 模式，实现 GET（公开）/ POST/PUT/DELETE（鉴权）。
3. `seed.sql` 追加示例数据（可选）。
4. `src/lib/types.ts` 加 `Link` 类型；`src/lib/api.ts` 加 `api.getLinks/createLink/...`。
5. 前台：`src/components/public/` 加展示组件，在 `src/pages/Home.tsx` 接入数据。
6. 后台：`src/components/admin/LinksAdmin.tsx`（参考 `SkillsAdmin.tsx`），在 `src/pages/Admin.tsx` 的 `tabs` 注册。
7. `npm run build && npx tsc -p tsconfig.functions.json` 验证类型。

### 4.2 修改某个字段
- 前端表单在对应 `src/components/admin/*` 中；API 在 `functions/api/*`；类型在 `src/lib/types.ts`。三处保持一致即可。

### 4.3 本地联调
```bash
npx wrangler d1 execute personal-site-db --local --file=./migrations/0001_init.sql
npx wrangler d1 execute personal-site-db --local --file=./seed.sql
npm run build && npx wrangler pages dev dist
```
- 前台：`http://localhost:8788/`
- 后台：`http://localhost:8788/#/admin`（本地密码见 `wrangler.toml` 的 `ADMIN_PASSWORD`）。

### 4.4 部署
见 `README.md` 与 `docs/TECH_DESIGN.md` 第 7 节。注意：先在控制台/通过 `wrangler secret put` 设置 `ADMIN_PASSWORD` 与 `SESSION_SECRET`，并把 `wrangler.toml` 的 `database_id` 替换为真实 id。

## 5. 类型检查

- 前端：`npm run typecheck`（tsc 检查 `src/`）。
- Functions：`npx tsc -p tsconfig.functions.json`（使用 `@cloudflare/workers-types`，验证 `functions/`）。

## 6. 易错点提醒

- **Functions 相对路径**：`functions/api/*.ts` 引用 `lib/auth.ts` 用 `../lib/auth`；`functions/api/<子目录>/*.ts` 用 `../../lib/auth`。
- **HashRouter**：所有站内跳转用 `<Link to="/admin">`，会渲染为 `/#/admin`；不要写 `<a href="/admin">`，否则需要服务端回退。
- **D1 迁移不可变**：改表结构请新增迁移文件，不要修改已执行的 `0001_*.sql`。
- **Cookie 同源**：前台与 `/api` 同域，`fetch` 已带 `credentials: "include"`，无需 CORS 配置；若拆分前后端域名才需要处理 CORS。
- **本地 D1 与线上 D1 隔离**：`--local` 与 `--remote` 数据互不可见，首次部署务必对 `--remote` 执行迁移与种子。
