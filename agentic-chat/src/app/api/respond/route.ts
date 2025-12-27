import { NextResponse } from "next/server";
import { DEFAULT_PERSONA, generateAgentReply, type AgentRequest } from "@/lib/generator";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<AgentRequest> & { customerName?: string };
    if (!body?.message || !body.platform) {
      return NextResponse.json({ error: "Missing message or platform." }, { status: 400 });
    }

    const persona = {
      ...DEFAULT_PERSONA,
      ...(body.persona ?? {})
    };

    const result = generateAgentReply({
      message: body.message,
      platform: body.platform,
      persona,
      customerName: body.customerName
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("respond api error", error);
    return NextResponse.json({ error: "Failed to craft response." }, { status: 500 });
  }
}
