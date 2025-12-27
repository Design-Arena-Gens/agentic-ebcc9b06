"use client";

import { useMemo, useState } from "react";
import type { AgentPersona, AgentResponse, ChannelId } from "@/lib/generator";
import { DEFAULT_PERSONA } from "@/lib/generator";

interface ConversationMessage {
  id: string;
  from: "customer" | "agent";
  text: string;
  platform: ChannelId;
}

const CHANNELS: { id: ChannelId; label: string; blurb: string; accent: string }[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    blurb: "Lightning-fast responses with CTA buttons and catalog hand-offs.",
    accent: "from-emerald-500/30 to-emerald-800/40"
  },
  {
    id: "messenger",
    label: "Messenger",
    blurb: "Smart scripts that sync with your Facebook page automations.",
    accent: "from-blue-500/30 to-blue-800/40"
  },
  {
    id: "instagram",
    label: "Instagram DM",
    blurb: "Story-friendly replies tuned for creators and shoppers.",
    accent: "from-fuchsia-500/30 to-purple-800/40"
  }
];

const PERSONA_PRESETS: AgentPersona[] = [
  {
    brandName: "Glow Atelier",
    brandVoice: "Playful, glam, hype-building",
    signatureOffer: "made-to-order glam bundles",
    callToAction: "Claim your VIP styling consult",
    guarantee: "We save a slot for you and send curated looks in minutes.",
    followUpDelay: "5 minutes"
  },
  {
    brandName: "Pulse Fitness Lab",
    brandVoice: "Direct, motivational, data-backed",
    signatureOffer: "12-week performance jumpstart program",
    callToAction: "Schedule your performance audit",
    guarantee: "We map a measurable win for your next 30 days.",
    followUpDelay: "90 seconds"
  },
  {
    brandName: "Bloom & Bean",
    brandVoice: "Cozy, reassuring, service-first",
    signatureOffer: "artisan coffee subscriptions",
    callToAction: "Start your tasting flight",
    guarantee: "We roast after you order so every cup arrives fresh.",
    followUpDelay: "4 minutes"
  }
];

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function Home() {
  const [persona, setPersona] = useState<AgentPersona>({ ...DEFAULT_PERSONA });
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChannelId>("whatsapp");
  const [draftMessage, setDraftMessage] = useState(
    "Hi! How much is your starter package and do you deliver outside Dhaka?"
  );
  const [latestResponse, setLatestResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const heroSubtitle = useMemo(
    () =>
      `Train a ${persona.brandVoice.toLowerCase()} agent for ${persona.brandName} that converts social DMs into buyers automatically.`,
    [persona.brandVoice, persona.brandName]
  );

  async function handleSend() {
    if (!draftMessage.trim()) return;

    const newCustomerMessage: ConversationMessage = {
      id: uid(),
      from: "customer",
      text: draftMessage,
      platform: activeChannel
    };

    setConversation((prev) => [...prev, newCustomerMessage]);
    setDraftMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newCustomerMessage.text,
          platform: newCustomerMessage.platform,
          persona
        })
      });

      if (!res.ok) {
        throw new Error("Failed to reach agent brain");
      }

      const data = (await res.json()) as AgentResponse;
      const agentMessage: ConversationMessage = {
        id: uid(),
        from: "agent",
        text: data.reply,
        platform: activeChannel
      };
      setConversation((prev) => [...prev, agentMessage]);
      setLatestResponse(data);
    } catch (error) {
      console.error("agent generation failed", error);
      const fallback: ConversationMessage = {
        id: uid(),
        from: "agent",
        text: "Sorry, I couldn't craft a reply right now. Please try again.",
        platform: activeChannel
      };
      setConversation((prev) => [...prev, fallback]);
      setLatestResponse(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gradient min-h-screen pb-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pt-20">
        <header className="space-y-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-1 text-sm text-slate-300">
            Omnichannel social commerce cockpit
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-6xl">
            Build one intelligent agent that closes sales across WhatsApp, Messenger & Instagram.
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-slate-300 sm:text-xl">{heroSubtitle}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-blue-500/30 transition hover:scale-105"
              onClick={() => {
                setPersona(PERSONA_PRESETS[0]);
              }}
            >
              Load high-converting preset
            </button>
            <span className="text-sm text-slate-400">
              Auto-personalised playbooks for each channel.
            </span>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:items-start">
          <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur">
            <h2 className="font-display text-2xl text-slate-100">Persona control room</h2>
            <p className="text-sm text-slate-400">
              Tune the agent voice and offer. Updates are reflected instantly in all conversations.
            </p>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">Brand name</span>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-primary focus:outline-none"
                  value={persona.brandName}
                  onChange={(event) =>
                    setPersona((prev) => ({ ...prev, brandName: event.target.value }))
                  }
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">Brand voice</span>
                <textarea
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
                  rows={2}
                  value={persona.brandVoice}
                  onChange={(event) =>
                    setPersona((prev) => ({ ...prev, brandVoice: event.target.value }))
                  }
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">Signature offer</span>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-primary focus:outline-none"
                  value={persona.signatureOffer}
                  onChange={(event) =>
                    setPersona((prev) => ({ ...prev, signatureOffer: event.target.value }))
                  }
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">Call to action</span>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-primary focus:outline-none"
                  value={persona.callToAction}
                  onChange={(event) =>
                    setPersona((prev) => ({ ...prev, callToAction: event.target.value }))
                  }
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">Brand guarantee</span>
                <textarea
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
                  rows={2}
                  value={persona.guarantee}
                  onChange={(event) =>
                    setPersona((prev) => ({ ...prev, guarantee: event.target.value }))
                  }
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">Follow-up delay</span>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-primary focus:outline-none"
                  value={persona.followUpDelay}
                  onChange={(event) =>
                    setPersona((prev) => ({ ...prev, followUpDelay: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Quick persona swaps</h3>
              <div className="grid gap-2">
                {PERSONA_PRESETS.map((preset) => (
                  <button
                    key={preset.brandName}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-primary"
                    onClick={() => setPersona(preset)}
                  >
                    <span className="block font-semibold text-slate-100">{preset.brandName}</span>
                    <span className="text-xs text-slate-400">{preset.brandVoice}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`rounded-2xl border border-slate-800 bg-gradient-to-br p-4 text-left transition ${
                    activeChannel === channel.id
                      ? "ring-2 ring-primary"
                      : "opacity-70 hover:opacity-100"
                  } ${channel.accent}`}
                >
                  <span className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                    {channel.label}
                  </span>
                  <p className="mt-2 text-sm text-slate-200/80">{channel.blurb}</p>
                </button>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/50">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-slate-100">Live conversation lab</h2>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
                    {activeChannel}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-200">
                    {conversation.length === 0 ? (
                      <p className="text-slate-400">
                        Start by typing a customer DM. The agent will answer with platform-aware copy.
                      </p>
                    ) : (
                      conversation.map((message) => (
                        <div key={message.id} className="mb-4 space-y-1">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                              message.from === "agent"
                                ? "bg-primary/10 text-primary"
                                : "bg-emerald-500/10 text-emerald-300"
                            }`}
                          >
                            {message.from === "agent" ? `${persona.brandName} Agent` : "Customer"}
                          </span>
                          <pre className="whitespace-pre-wrap rounded-xl bg-slate-950/70 p-3 font-sans text-sm">
                            {message.text}
                          </pre>
                        </div>
                      ))
                    )}
                    {loading && (
                      <p className="animate-pulse text-xs text-slate-500">Crafting next best message…</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-primary focus:outline-none"
                      placeholder="Type a customer message to see the agent respond"
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        onClick={handleSend}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? "Generating…" : "Respond with intelligence"}
                      </button>
                      <p className="text-xs text-slate-500">
                        Responses blend persona tone, intent detection, and platform rituals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                <h3 className="font-display text-xl text-slate-100">Conversion intelligence</h3>
                {latestResponse ? (
                  <div className="space-y-4 text-sm text-slate-300">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-slate-500">Intent</span>
                      <p className="text-base text-slate-100">
                        {latestResponse.intent} · {(latestResponse.confidence * 100).toFixed(0)}% confident
                      </p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-slate-500">CTA deployed</span>
                      <p className="text-slate-200">{latestResponse.callToAction}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-slate-500">Follow-up automation</span>
                      <p className="text-slate-200">{latestResponse.followUp}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-slate-500">Operator checklist</span>
                      <ul className="mt-1 space-y-2">
                        {latestResponse.suggestedNextSteps.map((step) => (
                          <li key={step} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Send a message to view smart intent detection, CTA strategy, and follow-up automation.
                  </p>
                )}
              </aside>
            </div>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-8">
              <h3 className="font-display text-2xl text-slate-100">Integration launchpad</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <h4 className="text-lg font-semibold text-slate-100">WhatsApp Cloud API</h4>
                  <p className="text-sm text-slate-400">
                    Connect via Meta&apos;s Cloud API. Use this endpoint: <code className="break-all text-xs text-slate-300">/api/respond</code> in your webhook. Map inbound messages to <code>message</code>, <code>platform</code>, and optional <code>customerName</code>.
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <h4 className="text-lg font-semibold text-slate-100">Messenger Automation</h4>
                  <p className="text-sm text-slate-400">
                    Plug into your Facebook Page app. The response payload ships ready-to-send copy plus agent guidance for human takeover.
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <h4 className="text-lg font-semibold text-slate-100">Instagram Direct</h4>
                  <p className="text-sm text-slate-400">
                    Use the Instagram Messaging API to relay story replies and reels comments. Keep the persona synced for consistent brand energy.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-primary/30 bg-primary/10 p-8 text-slate-100">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-display text-3xl">Ready to convert every DM into a buyer?</h3>
                  <p className="mt-2 text-sm text-primary-foreground/80">
                    Deploy this agent to WhatsApp, Facebook Messenger, and Instagram in a single afternoon.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/30 transition hover:scale-105"
                    onClick={() => setPersona(DEFAULT_PERSONA)}
                  >
                    Reset to default persona
                  </button>
                  <a
                    className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                    href="#"
                  >
                    Download deployment playbook
                  </a>
                </div>
              </div>
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}
