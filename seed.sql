-- 初始中文示例数据（部署后可于后台直接修改）
-- 说明：所有表均使用固定主键 + INSERT OR REPLACE，重复执行本脚本不会产生重复数据。

INSERT OR REPLACE INTO profile (id, name, title, avatar_url, bio, social_links, updated_at)
VALUES (
  1,
  '王传智',
  '全栈工程师 · 创意开发者',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  '六年 Web 全栈开发经验，热衷于把复杂的问题做成简单好用的产品。偏爱 TypeScript、React 与边缘计算，业余时间写技术博客、做开源工具。',
  '[{"label":"GitHub","url":"https://github.com/yourname"},{"label":"邮箱","url":"mailto:hi@chenyiming.dev"},{"label":"微博","url":"https://weibo.com/yourname"}]',
  strftime('%s','now') * 1000
);

INSERT OR REPLACE INTO skills (id, name, category, level, order_index, created_at) VALUES
(1, 'TypeScript', '前端', 92, 1, strftime('%s','now') * 1000),
(2, 'React', '前端', 90, 2, strftime('%s','now') * 1000),
(3, 'Vue 3', '前端', 80, 3, strftime('%s','now') * 1000),
(4, 'Node.js', '后端', 88, 4, strftime('%s','now') * 1000),
(5, 'Go', '后端', 75, 5, strftime('%s','now') * 1000),
(6, 'Python', '后端', 78, 6, strftime('%s','now') * 1000),
(7, 'Cloudflare', '运维/云', 82, 7, strftime('%s','now') * 1000),
(8, 'Docker', '运维/云', 80, 8, strftime('%s','now') * 1000);

INSERT OR REPLACE INTO projects (id, title, description, image_url, project_url, repo_url, tags, order_index, created_at) VALUES
(1, 'EdgeGallery 图床', '基于 Cloudflare Workers + R2 的极速图床，全球边缘节点直传直出，带一键分享与水印。', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop', 'https://example.com/edgegallery', 'https://github.com/yourname/edgegallery', '["Cloudflare","R2","TypeScript"]', 1, strftime('%s','now') * 1000),
(2, 'NoteFlow 笔记', '支持双向链接与本地优先同步的 Markdown 笔记应用，离线可用、端到端加密。', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=500&fit=crop', 'https://example.com/noteflow', 'https://github.com/yourname/noteflow', '["React","IndexedDB","PWA"]', 2, strftime('%s','now') * 1000),
(3, 'DevPulse 监控', '面向个人开发者的轻量站点监控，分钟级探测、异常推送，自带可分享的状态页。', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop', 'https://example.com/devpulse', 'https://github.com/yourname/devpulse', '["Go","SQLite","Cron"]', 3, strftime('%s','now') * 1000),
(4, 'PixelForge 工具箱', '聚合各类前端小工具（颜色提取、SVG 压缩、正则测试）的在线工作台。', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=500&fit=crop', 'https://example.com/pixelforge', 'https://github.com/yourname/pixelforge', '["Vite","工具","开源"]', 4, strftime('%s','now') * 1000);

INSERT OR REPLACE INTO blog_posts (id, title, summary, content, published_at, created_at) VALUES
(1, '为什么我把博客搬到了边缘计算', '记录一次把个人博客从传统服务器迁移到 Cloudflare Pages 的全过程，以及性能与成本的真实对比。', '折腾了两周，终于把跑了三年的博客从一台 2C2G 的云服务器迁到了 Cloudflare Pages。\n\n最直观的变化是首屏时间从 800ms 降到了 120ms 左右，而且再也不用半夜被告警叫醒去重启服务。\n\n边缘渲染 + 对象存储的组合，对个人站点来说几乎是零运维的完美解。当然也有坑：函数冷启动、D1 的写入延迟，以及本地调试的心智负担。后面几篇会慢慢展开。', 1717200000000, 1717200000000),
(2, '用 D1 做一个不要后端的应用', 'Cloudflare D1 让前端工程师也能轻松拥有结构化数据库，本文聊聊它的边界与最佳实践。', 'D1 本质是分布式的 SQLite，对读多写少的个人项目非常友好。\n\n我的经验是：列表查询走参数化 SQL，避免任何字符串拼接；写操作尽量聚合在一次事务里；需要全文搜索时，先用 LIKE 顶着，量上来再换方案。\n\n它不适合强一致的高并发交易，但做一个作品集后台绰绰有余。', 1719800000000, 1719800000000),
(3, '暗色主题不是把背景涂黑', '聊聊我对"高级感"暗色界面的理解：对比、层次与一点点渐变光。', '很多人做暗色就是 background:#000，然后文字变白。结果又平又刺眼。\n\n真正耐看的暗色，背景往往是带一点蓝的深灰（#0B0F1A），强调色用低饱和的渐变，卡片用半透明 + 模糊来制造层次。\n\n光，是暗色界面的灵魂。', 1722400000000, 1722400000000);
