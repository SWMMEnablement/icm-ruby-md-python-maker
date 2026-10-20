import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText } from "npm:ai";
import { z } from "npm:zod@3";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.ts";

import { admin, languageOf } from "../_shared/test-runs.ts";

const BodySchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  content: z.string().min(1).max(200_000),
  framework: z.string().trim().max(50).optional(),
  deviceId: z.string().uuid().optional(),
  testFileName: z.string().trim().max(255).optional(),
});

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured for this app." }, 500);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const { fileName, content, framework, deviceId, testFileName } = parsed.data;

  const db = admin();
  let runId: string | null = null;
  if (deviceId) {
    const { data } = await db.from("generated_tests").insert({
      device_id: deviceId, file_name: fileName, test_file_name: testFileName ?? null,
      language: languageOf(fileName), framework: framework ?? null, status: "running",
    }).select("id").single();
    runId = data?.id ?? null;
  }
  const finish = async (status: string, tests: string | null, error: string | null) => {
    if (!runId) return;
    await db.from("generated_tests").update({ status, tests, error, updated_at: new Date().toISOString() }).eq("id", runId);
  };

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  // Surface gateway errors (402/403/429) with their status before streaming.
  let upstreamError: { status: number; message: string } | null = null;

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system:
      "You are a senior test engineer. Given a source file, write a complete, runnable unit test file " +
      "covering its key behavior: public functions/classes, typical inputs, edge cases, and error paths. " +
      "Use the idiomatic test framework for the language (pytest for Python, RSpec for Ruby, Vitest for JS/TS, " +
      "JUnit 5 for Java, Go testing for Go, etc.) unless one is requested. Output ONLY the test file source code, " +
      "no markdown fences and no prose. Put brief explanatory comments at the top of the file.",
    messages: [
      {
        role: "user",
        content:
          `File name: ${fileName}\n` +
          (framework ? `Requested test framework: ${framework}\n` : "") +
          `\nSource:\n${content}`,
      },
    ],
    abortSignal: req.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
    onError: ({ error }) => {
      const e = error as { statusCode?: number; message?: string };
      upstreamError = { status: e.statusCode ?? 500, message: e.message ?? "AI request failed" };
      console.error("generate-unit-tests error", e.statusCode, e.message);
    },
  });

  const response = result.toTextStreamResponse({ headers: corsHeaders });
  // Peek first chunk so early gateway errors return a proper status.
  const reader = response.body!.getReader();
  const first = await reader.read();
  if (first.done && upstreamError) {
    const { status, message } = upstreamError as { status: number; message: string };
    const friendly =
      status === 402 ? "AI credits are used up. Add credits in Settings → Plans & credits."
      : status === 429 ? "Too many requests right now. Please try again in a minute."
      : message;
    return json({ error: friendly }, status);
  }
  const body = new ReadableStream({
    async start(controller) {
      if (!first.done) controller.enqueue(first.value);
      while (true) {
        const c = await reader.read();
        if (c.done) break;
        controller.enqueue(c.value);
      }
      controller.close();
    },
    cancel: (r) => reader.cancel(r),
  });
  return withLovableAiGatewayRunIdHeader(
    new Response(body, { status: 200, headers: response.headers }),
    runIdFetch,
  );
});
