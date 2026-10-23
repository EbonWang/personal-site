# 技术设计文档（TECH_DESIGN）—— 个人作品集网站

## 1. 架构总览

```
┌─────────────┐   HTTPS   ┌──────────────────────┐
│  浏览器      │ ───────▶ │  Cloudflare Pages    │
│ 前台+后台SPA │          │  ├─ 静态资源 dist/    │
└─────────────┘          │  ├─ /api/* Functions  │
                        │  └─ D1 (SQLite)       │
                        └──────────────────────┘
```

- **静态层**：Vite 将 React 应用构建为 `dist/`，由 Pages 作为静态资源托管。
- **API 层**：`functions/api/*` 下的 Pages Functions 处理请求，读写 D1。
- **数据层**：Cloudflare D1（SQLite），通过 `wrangler.toml` 绑定名 `DB`。
- **鉴权**：Web Crypto 生成 PBKDF2 密码哈希 + HMAC 签名 HttpOnly Cookie。

### 关键技术决策
- **不用 Next.js**：Next 在 Cloudflare 需 `next-on-pages` 适配，易有运行时摩擦；React+Vite 静态资源 + Pages Functions 是官方一等公民。
- **用 D1 而非 KV**：技能/项目/博客为多行结构化数据，需要查询与排序，SQLite 更合适。
- **无会话表**：HMAC 签名 Cookie（含签发时间戳）即可无状态校验，避免会话表与过期清理。
- **HashRouter**：纯静态 SPA 在任意托管商都不会因深链 404（无需 `_redirects` 回退，规避 Cloudflare 的无限循环告警）。

## 2. 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | React 18 + TypeScript + Vite 5 + Tailwind CSS 3.4 + React Router 6 |
| UI 图标 | lucide-react + react-icons |
| 后端 | Cloudflare Pages Functions (TypeScript, esbuild 打包) |
| 数据库 | Cloudflare D1 (SQLite) + 参数化 SQL |
| 鉴权 | Web Crypto (PBKDF2 / HMAC-SHA256) + Cookie |
| 部署 | Cloudflare Pages (`wrangler pages deploy dist`) |

## 3. 目录结构

```
personal-site/
├── functions/                 # Pages Functions（API）
│   ├── lib/auth.ts            # Env 类型 + 鉴权/HTTP 工具
│   └── api/
│       ├── auth/{login,logout,me}.ts
│       ├── profile.ts         # 公开 GET / 鉴权 PUT
│       ├── skills.ts          # 公开 GET / 鉴权 POST/PUT/DELETE
│       ├── projects.ts        # 同上
│       ├── blog.ts            # 公开 GET(?q=搜索) / 鉴权 POST/PUT/DELETE
│       ├── blog/[id].ts       # 公开 GET 单篇纯文本
│       ├── admin/password.ts  # 鉴权改密码
│       └── export.ts          # 鉴权导出全站 JSON
├── src/                       # React 前端
│   ├── lib/                   # types / api / theme / auth / toast / ui
│   ├── components/public/     # Navbar Hero Skills Projects Blog Footer
│   ├── components/admin/      # ProfileForm Skills/Projects/BlogAdmin SettingsAdmin
│   └── pages/                 # Home / AdminLogin / Admin
├── migrations/0001_init.sql   # D1 建表
├── seed.sql                   # 中文示例数据
├── wrangler.toml             # Pages 构建 + D1 绑定 + 变量
├── vite.config.ts / tailwind.config.js / tsconfig*.json
├── docs/                     # PRD / TECH_DESIGN / AGENTS
└── README.md
```

## 4. D1 Schema（`migrations/0001_init.sql`）

```sql
CREATE TABLE profile ( id INTEGER PRIMARY KEY CHECK(id=1), name TEXT, title TEXT,
  avatar_url TEXT, bio TEXT, social_links TEXT, updated_at INTEGER );
CREATE TABLE skills ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
  category TEXT, level INTEGER, order_index INTEGER, created_at INTEGER );
CREATE TABLE projects ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
  description TEXT, image_url TEXT, project_url TEXT, repo_url TEXT,
  tags TEXT, order_index INTEGER, created_at INTEGER );
CREATE TABLE blog_posts ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
  summary TEXT, content TEXT, published_at INTEGER, created_at INTEGER );
CREATE TABLE admin ( id INTEGER PRIMARY KEY CHECK(id=1), password_hash TEXT, updated_at INTEGER );
```

- `social_links` 与 `tags` 以 JSON 字符串存储，读取时 `JSON.parse`。
- 密码哈希格式：`pbkdf2$<saltHex>$<hashHex>`（PBKDF2-SHA256, 100k 迭代）。

## 5. API 约定

所有响应为 JSON `{...}`；错误统一 `{ "error": "code" }`，写接口未鉴权返回 `401`。

| 方法 & 路径 | 鉴权 | 说明 |
| --- | --- | --- |
| GET /api/profile | 否 | 读取个人介绍 |
| PUT /api/profile | 是 | 更新个人介绍 |
| GET /api/skills | 否 | 技能列表 |
| POST/PUT/DELETE /api/skills (`?id=` for DELETE) | 是 | 技能增改删 |
| GET /api/projects | 否 | 项目列表 |
| POST/PUT/DELETE /api/projects | 是 | 项目增改删 |
| GET /api/blog?q=关键词 | 否 | 博客列表（支持搜索） |
| POST/PUT/DELETE /api/blog | 是 | 博客增改删 |
| GET /api/blog/:id | 否 | 单篇纯文本 |
| POST /api/auth/login | 否 | 登录（下发签名 Cookie） |
| POST /api/auth/logout | 否 | 登出（清除 Cookie） |
| GET /api/auth/me | 否 | 返回 `{authed:bool}` |
| POST /api/admin/password | 是 | 修改管理员密码 |
| GET /api/export | 是 | 导出全站 JSON |

## 6. 鉴权方案

1. **登录**：`/api/auth/login` 校验密码（优先比对 `admin` 表哈希；无记录时回退到环境变量 `ADMIN_PASSWORD`）。通过后用 `SESSION_SECRET` 对 `admin:<timestamp>` 做 HMAC-SHA256，得到 `base64(payload).signature` 作为 Cookie 值，设为 `HttpOnly; SameSite=Lax; Max-Age=7d`。
2. **校验**：受保护接口调用 `verifySession(cookie, SESSION_SECRET)`，校验签名并确认 7 天内。
3. **改密码**：`/api/admin/password` 写入新的 PBKDF2 哈希到 `admin` 表（此后登录以该哈希为准）。

## 7. 部署（Cloudflare Pages）

前置：已安装 Node 18+，拥有 Cloudflare 账号与 `CLOUDFLARE_API_TOKEN`（含 Pages/D1 权限）。

```bash
npm install
npm run build                       # 产出 dist/
npx wrangler d1 create personal-site-db        # 复制返回的 id 填入 wrangler.toml
npx wrangler d1 execute personal-site-db --remote --file=./migrations/0001_init.sql
npx wrangler d1 execute personal-site-db --remote --file=./seed.sql
npx wrangler secret put ADMIN_PASSWORD          # 设置管理员密码（≥6 位）
npx wrangler secret put SESSION_SECRET          # 设置 Cookie 签名密钥（随机长字符串）
npx wrangler pages deploy dist                  # 部署
```

- `wrangler.toml` 中 `database_id` 需替换为 `d1 create` 返回的 id。
- 也可在 Cloudflare 控制台「Pages → 连接 Git 仓库」自动构建（构建命令 `npm run build`，输出目录 `dist`），并在控制台设置 `ADMIN_PASSWORD` / `SESSION_SECRET` 两个环境变量（Secret 类型）。

## 8. 安全与性能

- 全部 SQL 使用 `?` 占位参数化，杜绝注入。
- 密码哈希使用加盐 PBKDF2；Cookie 为 HttpOnly，降低 XSS 窃取风险。
- 读接口为 O(1)~O(n) 单表扫描，数据量极小，无性能瓶颈；列表接口支持服务端 `?q=` 过滤。
- Functions 仅记录关键错误，不记录密码与 Cookie 明文。

## 9. 本地开发

```bash
npm install
npm run dev                         # 仅前端（http://localhost:5173，需自带 mock 或连本地 API）
# 完整前后台联调（推荐）：
npx wrangler d1 execute personal-site-db --local --file=./migrations/0001_init.sql
npx wrangler d1 execute personal-site-db --local --file=./seed.sql
npm run build
npx wrangler pages dev dist         # http://localhost:8788，已用本地 D1 模拟
```

本地默认管理员密码见 `wrangler.toml` 的 `ADMIN_PASSWORD`（生产请用 `wrangler secret put` 覆盖）。
