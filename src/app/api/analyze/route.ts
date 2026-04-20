import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildStrategyPrompt } from "@/lib/ai/prompts";
import type { StrategyGoal } from "@/types/strategy";
import type { DecisionEntry } from "@/types/decisions";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    reportSummary: string;
    goal: StrategyGoal;
    customGoalText?: string;
    decisionHistory?: DecisionEntry[];
    targetMetrics?: { acos?: number; roas?: number };
  };

  const { reportSummary, goal, customGoalText, decisionHistory, targetMetrics } = body;

  if (!reportSummary || !goal) {
    return NextResponse.json({ error: "reportSummary e goal sono obbligatori" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurata" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const prompt = buildStrategyPrompt({ reportSummary, goal, customGoalText, decisionHistory, targetMetrics });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
