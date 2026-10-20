import { createClient } from "npm:@supabase/supabase-js@2";

export const admin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

const LANGS: Record<string, string> = {
  py: "Python", rb: "Ruby", js: "JavaScript", jsx: "JavaScript", ts: "TypeScript", tsx: "TypeScript",
  java: "Java", go: "Go", rs: "Rust", cs: "C#", cpp: "C++", c: "C", php: "PHP", kt: "Kotlin",
  swift: "Swift", scala: "Scala", sh: "Shell",
};
export const languageOf = (fileName: string) =>
  LANGS[fileName.split(".").pop()?.toLowerCase() ?? ""] ?? "Other";
