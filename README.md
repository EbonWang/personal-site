# 个人作品集网站（Cloudflare Pages + D1 + Pages Functions）

复刻 `myshow-bey.pages.dev` 的个人网站：前台展示（个人介绍 / 技能 / 项目 / 博客），后台管理（密码登录 + 四模块 CRUD + 搜索 + 改密码 + 导出 JSON）。

## 技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind CSS
- 后端：Cloudflare Pages Functions
- 数据库：Cloudflare D1 (SQLite)
- 鉴权：Web Crypto（PBKDF2 密码哈希 + HMAC 签名 Cookie）

## 目录速览

- `functions/` —— API（Pages Functions）
- `src/` —— React 前台 + 后台
- `migrations/0001_init.sql` —— D1 建表
- `seed.sql` —— 中文示例数据
- `wrangler.toml` —— Pages/D1 配置

## 快速开始（本地）

```bash
npm install
# 初始化本地数据库
npx wrangler d1 execute personal-site-db --local --file=./migrations/0001_init.sql
npx wrangler d1 execute personal-site-db --local --file=./seed.sql
# 构建并本地联调（含 API + D1 模拟）
npm run build
npx wrangler pages dev dist
```

- 前台：http://localhost:8788/
- 后台：http://localhost:8788/#/admin
- 本地默认管理员密码：`admin12345`（来自 `wrangler.toml` 的 `ADMIN_PASSWORD`，生产环境务必用 `wrangler secret put` 覆盖）

## 部署到 Cloudflare Pages

前置：安装 Node 18+，拥有 Cloudflare 账号与具备 Pages/D1 权限的 API Token。

```bash
npm install
npm run build

# 1) 创建 D1 数据库，把返回的 id 填入 wrangler.toml 的 database_id
npx wrangler d1 create personal-site-db

# 2) 执行迁移与种子（线上数据库）
npx wrangler d1 execute personal-site-db --remote --file=./migrations/0001_init.sql
npx wrangler d1 execute personal-site-db --remote --file=./seed.sql

# 3) 设置密钥（不要写进仓库）
npx wrangler secret put ADMIN_PASSWORD      # 你的管理员密码（≥6 位）
npx wrangler secret put SESSION_SECRET      # 随机长字符串，用于 Cookie 签名

# 4) 部署
npx wrangler pages deploy dist
```

也可在 Cloudflare 控制台「Pages → 连接 Git 仓库」自动构建：构建命令 `npm run build`，输出目录 `dist`，并在控制台添加 `ADMIN_PASSWORD`、`SESSION_SECRET` 两个 Secret 变量。

## 配置说明

| 变量 | 作用 | 设置方式 |
| --- | --- | --- |
| `DB` | D1 数据库绑定 | `wrangler.toml` 中的 `[[d1_databases]]` |
| `ADMIN_PASSWORD` | 首次登录默认密码（无 admin 记录时生效） | `wrangler secret put`（推荐）/ `[vars]` |
| `SESSION_SECRET` | Cookie 签名密钥 | `wrangler secret put`（推荐）/ `[vars]` |

## 后台功能

登录 `/#/admin` 后可：编辑个人介绍、技能/项目/博客的增删改查、关键词搜索、修改管理员密码、导出全站 JSON。

## 文档

- `docs/PRD.md` —— 产品需求文档
- `docs/TECH_DESIGN.md` —— 技术设计文档
- `docs/AGENTS.md` —— 智能体 / 开发者扩展指南

## 类型检查

```bash
npm run typecheck                       # 前端 (src/)
npx tsc -p tsconfig.functions.json      # API (functions/)
```
