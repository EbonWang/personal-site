import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Profile, Skill, Project, BlogListItem } from "../lib/types";
import Navbar from "../components/public/Navbar";
import Hero from "../components/public/Hero";
import Skills from "../components/public/Skills";
import Projects from "../components/public/Projects";
import Blog from "../components/public/Blog";
import Footer from "../components/public/Footer";

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blog, setBlog] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProfile(), api.getSkills(), api.getProjects(), api.getBlog()])
      .then(([p, s, pr, b]) => {
        setProfile(p);
        setSkills(s);
        setProjects(pr);
        setBlog(b);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-ink-900 dark:bg-ink-900 dark:text-slate-200">
      <Navbar />
      <main className="pt-16">
        <Hero profile={profile} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Blog posts={blog} />
      </main>
      <Footer />
    </div>
  );
}
