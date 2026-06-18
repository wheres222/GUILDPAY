/**
 * Single source of truth for the bot's message style — Discord **Components V2**.
 *
 * Every message the bot sends (panels, command replies, DMs) goes through here so
 * the whole product uses ONE consistent look: a Container (no colored sidebar by
 * default), an optional title, optional media, body text, and buttons INSIDE the
 * container. Media is opt-in per message (not every message has a banner).
 *
 * Usage:
 *   await channel.send(panelMessage({ title, body, buttons }))
 *   await interaction.reply(ephemeralPanel({ title, body }))
 *   await user.send(panelMessage({ title, body }))
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  type InteractionEditReplyOptions,
  type InteractionReplyOptions,
  type MessageCreateOptions,
} from "discord.js";

/** One brand accent for the whole bot. `null` = clean, no colored sidebar. */
export const BRAND_ACCENT: number | null = null;

export type PanelButtonStyle =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "link";

export interface PanelButton {
  /** Optional — omit for an emoji-only button. */
  label?: string
  style?: PanelButtonStyle
  customId?: string
  url?: string
  emoji?: string
}

export interface SelectOption {
  label: string
  value: string
  description?: string
  emoji?: string
}

export interface SelectSpec {
  customId: string
  placeholder?: string
  options: readonly SelectOption[]
}

export interface PanelSpec {
  title?: string
  /** Markdown body. */
  body?: string
  /** Optional banner/gif/image/QR — external URL or attachment://name. Opt-in. */
  mediaUrl?: string
  buttons?: PanelButton[]
  /** Buttons per row (1–5). Default 5. Use 2 for a two-column grid. */
  buttonColumns?: number
  /** Optional dropdown (e.g. choose a coin). */
  select?: SelectSpec
  /** Override the brand accent for this one panel. */
  accent?: number | null
}

function styleEnum(s?: PanelButtonStyle): ButtonStyle {
  switch (s) {
    case "secondary":
      return ButtonStyle.Secondary
    case "success":
      return ButtonStyle.Success
    case "danger":
      return ButtonStyle.Danger
    case "link":
      return ButtonStyle.Link
    default:
      return ButtonStyle.Primary
  }
}

function toButton(b: PanelButton): ButtonBuilder {
  const btn = new ButtonBuilder().setStyle(
    b.url ? ButtonStyle.Link : styleEnum(b.style),
  )
  if (b.label) btn.setLabel(b.label.slice(0, 80))
  if (b.url) btn.setURL(b.url)
  else if (b.customId) btn.setCustomId(b.customId)
  if (b.emoji) btn.setEmoji(b.emoji)
  return btn
}

/** Build the one canonical Container for a message. */
export function buildContainer(spec: PanelSpec): ContainerBuilder {
  const container = new ContainerBuilder()
  const accent = spec.accent === undefined ? BRAND_ACCENT : spec.accent
  if (accent != null) container.setAccentColor(accent)

  if (spec.title) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${spec.title}`),
    )
  }
  if (spec.title && (spec.body || spec.mediaUrl)) {
    container.addSeparatorComponents(new SeparatorBuilder())
  }
  if (spec.mediaUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(spec.mediaUrl),
      ),
    )
  }
  if (spec.body) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(spec.body.slice(0, 3900)),
    )
  }
  if (spec.select) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId(spec.select.customId)
      .setPlaceholder(spec.select.placeholder ?? "Select…")
      .addOptions(
        spec.select.options.map((o) => {
          const opt = new StringSelectMenuOptionBuilder()
            .setLabel(o.label.slice(0, 100))
            .setValue(o.value)
          if (o.description) opt.setDescription(o.description.slice(0, 100))
          if (o.emoji) opt.setEmoji(o.emoji)
          return opt
        }),
      )
    container.addActionRowComponents(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
    )
  }
  if (spec.buttons?.length) {
    const cols = Math.min(5, Math.max(1, spec.buttonColumns ?? 5))
    for (let i = 0; i < spec.buttons.length; i += cols) {
      const row = new ActionRowBuilder<ButtonBuilder>()
      for (const b of spec.buttons.slice(i, i + cols)) row.addComponents(toButton(b))
      container.addActionRowComponents(row)
    }
  }
  return container
}

/** Message payload for channel.send / user.send. */
export function panelMessage(spec: PanelSpec): MessageCreateOptions {
  return {
    components: [buildContainer(spec)],
    flags: MessageFlags.IsComponentsV2,
  }
}

/** Ephemeral payload for interaction.reply. */
export function ephemeralPanel(spec: PanelSpec): InteractionReplyOptions {
  return {
    components: [buildContainer(spec)],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  }
}

/** Flags to pass to interaction.deferReply so the later editReply can be V2. */
export const EPHEMERAL_V2_DEFER = {
  flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
}

/**
 * Payload for editReply after a deferReply(EPHEMERAL_V2_DEFER). The V2 flag is
 * already set on the deferred message, so we only send components here.
 */
export function panelEdit(spec: PanelSpec): InteractionEditReplyOptions {
  return { components: [buildContainer(spec)] }
}
