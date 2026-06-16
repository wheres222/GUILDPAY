"use client"

/**
 * Discord-faithful renderer for the bot's messages, so embeds from
 * lib/bot/embeds.ts can be previewed and tweaked in the browser without Discord.
 * Renders content + embeds + button components with Discord-like styling.
 */

import { ExternalLink } from "lucide-react"
import type { ReactNode } from "react"

// ── Types matching the Discord API shapes our builders emit ───────────────
export interface EmbedField {
  name: string
  value: string
  inline?: boolean
}
export interface Embed {
  title?: string
  description?: string
  color?: number
  url?: string
  fields?: EmbedField[]
  image?: { url: string }
  thumbnail?: { url: string }
  footer?: { text: string }
}
export interface ButtonComponent {
  type: 2
  style: 1 | 2 | 3 | 4 | 5
  label?: string
  custom_id?: string
  url?: string
  emoji?: { name: string }
}
export interface ActionRow {
  type: 1
  components: ButtonComponent[]
}

function hexColor(color?: number): string {
  if (color === undefined) return "#4f545c"
  return "#" + color.toString(16).padStart(6, "0")
}

// ── Minimal Discord markdown (bold, inline code, code blocks, timestamps) ──
function relTime(unix: number): string {
  const diff = unix * 1000 - Date.now()
  const mins = Math.round(diff / 60000)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute")
  const hrs = Math.round(mins / 60)
  if (Math.abs(hrs) < 24) return rtf.format(hrs, "hour")
  return rtf.format(Math.round(hrs / 24), "day")
}

function formatInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|<t:(\d+)(?::[a-zA-Z])?>/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(
        <code
          key={`${keyBase}-c${i}`}
          className="rounded bg-[#1e1f22] px-1 py-0.5 font-mono text-[13px]"
        >
          {m[1]}
        </code>,
      )
    } else if (m[2] !== undefined) {
      nodes.push(<strong key={`${keyBase}-b${i}`}>{m[2]}</strong>)
    } else if (m[3] !== undefined) {
      nodes.push(
        <span key={`${keyBase}-t${i}`} className="rounded bg-[#3f4248] px-1">
          {relTime(Number(m[3]))}
        </span>,
      )
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function Markdown({ text }: { text: string }) {
  // Split out ```code blocks``` first.
  const parts = text.split(/```([\s\S]*?)```/)
  return (
    <>
      {parts.map((part, idx) =>
        idx % 2 === 1 ? (
          <pre
            key={idx}
            className="my-1 overflow-x-auto rounded bg-[#1e1f22] p-2 font-mono text-[13px] text-[#dbdee1]"
          >
            {part.trim()}
          </pre>
        ) : (
          <span key={idx} className="whitespace-pre-wrap">
            {formatInline(part, String(idx))}
          </span>
        ),
      )}
    </>
  )
}

// ── Embed ─────────────────────────────────────────────────────────────────
export function DiscordEmbed({ embed }: { embed: Embed }) {
  return (
    <div
      className="my-1 max-w-[432px] rounded border-l-4 bg-[#2b2d31] py-2 pl-3 pr-4 text-[#dbdee1]"
      style={{ borderLeftColor: hexColor(embed.color) }}
    >
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          {embed.title && (
            <div
              className="mb-1 mt-1 text-[16px] font-semibold"
              style={{ color: embed.url ? "#00a8fc" : "#f2f3f5" }}
            >
              {embed.title}
            </div>
          )}
          {embed.description && (
            <div className="text-[14px] leading-[1.375]">
              <Markdown text={embed.description} />
            </div>
          )}

          {embed.fields && embed.fields.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {embed.fields.map((f, i) => (
                <div
                  key={i}
                  className={f.inline ? "min-w-[30%] flex-1" : "w-full"}
                >
                  <div className="mb-0.5 text-[14px] font-semibold text-[#f2f3f5]">
                    {f.name}
                  </div>
                  <div className="text-[14px] leading-[1.3]">
                    <Markdown text={f.value} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {embed.thumbnail?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={embed.thumbnail.url}
            alt=""
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
          />
        )}
      </div>

      {embed.image?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={embed.image.url}
          alt=""
          className="mt-3 max-h-72 w-full rounded-lg object-cover"
        />
      )}

      {embed.footer?.text && (
        <div className="mt-2 text-[12px] text-[#949ba4]">{embed.footer.text}</div>
      )}
    </div>
  )
}

// ── Buttons ────────────────────────────────────────────────────────────────
const BUTTON_STYLES: Record<number, string> = {
  1: "bg-[#5865f2] hover:bg-[#4752c4] text-white",
  2: "bg-[#4e5058] hover:bg-[#6d6f78] text-white",
  3: "bg-[#248046] hover:bg-[#1a6334] text-white",
  4: "bg-[#da373c] hover:bg-[#a12828] text-white",
  5: "bg-[#4e5058] hover:bg-[#6d6f78] text-white",
}

export function DiscordButtons({ rows }: { rows: ActionRow[] }) {
  return (
    <div className="mt-2 space-y-2">
      {rows.map((row, ri) => (
        <div key={ri} className="flex flex-wrap gap-2">
          {row.components.map((b, bi) => (
            <button
              key={bi}
              type="button"
              className={`inline-flex h-8 items-center gap-1.5 rounded px-4 text-[14px] font-medium transition-colors ${
                BUTTON_STYLES[b.style] ?? BUTTON_STYLES[2]
              }`}
            >
              {b.label}
              {b.style === 5 && <ExternalLink className="h-3.5 w-3.5 opacity-80" />}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Full message (avatar + bot name + content + embeds + buttons) ──────────
export function DiscordMessage({
  botName = "GuildPay",
  content,
  embeds,
  components,
  ephemeral,
}: {
  botName?: string
  content?: string
  embeds?: Embed[]
  components?: ActionRow[]
  ephemeral?: boolean
}) {
  return (
    <div className="rounded-lg bg-[#313338] p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5865f2] text-sm font-bold text-white">
          {botName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-medium text-[#f2f3f5]">{botName}</span>
            <span className="rounded bg-[#5865f2] px-1 py-px text-[10px] font-semibold uppercase text-white">
              App
            </span>
            <span className="text-[12px] text-[#949ba4]">Today</span>
          </div>

          {content && (
            <div className="mt-1 text-[14px] leading-[1.375] text-[#dbdee1]">
              <Markdown text={content} />
            </div>
          )}

          {embeds?.map((e, i) => (
            <DiscordEmbed key={i} embed={e} />
          ))}

          {components && components.length > 0 && <DiscordButtons rows={components} />}

          {ephemeral && (
            <div className="mt-2 text-[12px] text-[#949ba4]">
              Only you can see this •{" "}
              <span className="text-[#00a8fc]">Dismiss message</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
