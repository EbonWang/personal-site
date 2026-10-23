export interface SocialLink {
  label: string;
  url: string;
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  avatar_url: string;
  bio: string;
  social_links: SocialLink[];
  updated_at: number | null;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  order_index: number;
  created_at: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  repo_url: string;
  tags: string[];
  order_index: number;
  created_at: number;
}

export interface BlogListItem {
  id: number;
  title: string;
  summary: string;
  published_at: number;
  created_at: number;
}

export interface BlogPost extends BlogListItem {
  content: string;
}

export interface ExportData {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  blog_posts: BlogPost[];
  exported_at: number;
}
