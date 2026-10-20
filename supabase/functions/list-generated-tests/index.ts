import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { admin } from "../_shared/test-runs.ts";

const Body = z.object({ deviceId: z.string().uuid() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid request" }, 400);
  const { data, error } = await admin()
    .from("generated_tests")
    .select("id,file_name,test_file_name,language,framework,status,error,tests,created_at,updated_at")
    .eq("device_id", parsed.data.deviceId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return json({ error: "Could not load tests" }, 500);
  return json({ items: data });
});
