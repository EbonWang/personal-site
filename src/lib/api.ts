import type {
  Profile,
  Skill,
  Project,
  BlogListItem,
  BlogPost,
  SocialLink,
  ExportData,
} from "./types";

async function req<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || "request_failed");
    throw err;
  }
  return data as T;
}

export const api = {
  // 公开读
  getProfile: () => req<Profile>("/api/profile"),
  getSkills: () => req<Skill[]>("/api/skills"),
  getProjects: () => req<Project[]>("/api/projects"),
  getBlog: (q?: string) =>
    req<BlogListItem[]>("/api/blog" + (q ? `?q=${encodeURIComponent(q)}` : "")),
  getBlogPost: (id: number) => req<BlogPost>(`/api/blog/${id}`),

  // 鉴权
  login: (password: string) =>
    req("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => req("/api/auth/logout", { method: "POST" }),
  me: () => req<{ authed: boolean }>("/api/auth/me"),

  // 个人介绍
  updateProfile: (p: {
    name: string;
    title: string;
    avatar_url: string;
    bio: string;
    social_links: SocialLink[];
  }) => req("/api/profile", { method: "PUT", body: JSON.stringify(p) }),

  // 技能
  createSkill: (s: Partial<Skill>) =>
    req("/api/skills", { method: "POST", body: JSON.stringify(s) }),
  updateSkill: (s: Partial<Skill>) =>
    req("/api/skills", { method: "PUT", body: JSON.stringify(s) }),
  deleteSkill: (id: number) => req(`/api/skills?id=${id}`, { method: "DELETE" }),

  // 项目
  createProject: (p: Partial<Project>) =>
    req("/api/projects", { method: "POST", body: JSON.stringify(p) }),
  updateProject: (p: Partial<Project>) =>
    req("/api/projects", { method: "PUT", body: JSON.stringify(p) }),
  deleteProject: (id: number) =>
    req(`/api/projects?id=${id}`, { method: "DELETE" }),

  // 博客
  createBlog: (b: Partial<BlogPost>) =>
    req("/api/blog", { method: "POST", body: JSON.stringify(b) }),
  updateBlog: (b: Partial<BlogPost>) =>
    req("/api/blog", { method: "PUT", body: JSON.stringify(b) }),
  deleteBlog: (id: number) => req(`/api/blog?id=${id}`, { method: "DELETE" }),

  // 设置
  changePassword: (password: string) =>
    req("/api/admin/password", { method: "POST", body: JSON.stringify({ password }) }),
  exportData: () => req<ExportData>("/api/export"),
};
