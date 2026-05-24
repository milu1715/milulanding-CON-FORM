import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildNextMovePrompt } from "@/lib/ai/prompts";
import type { DecisionEntry } from "@/types/decisions";

export async function POST(req: NextRequest) {
  const { reportSummary, decisionHistory } = await req.json() as {
    reportSummary: string;
    decisionHistory: DecisionEntry[];
  };

  if (!reportSummary) {
    return NextResponse.json({ error: "reportSummary obbligatorio" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurata" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const prompt = buildNextMovePrompt({ reportSummary, decisionHistory: decisionHistory ?? [] });

  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ nextMove: text, reasoning: "", expectedImpact: "", priority: "medium" });
  }
}
