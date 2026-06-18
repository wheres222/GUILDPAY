/**
 * Crypto options for the in-Discord coin picker (a 2-column button grid).
 *
 * `emoji` accepts a standard emoji OR a custom server/app emoji as "<:name:id>"
 * (animated: "<a:name:id>"). These use the server's uploaded currency emojis;
 * the bot must share a server with them (it does) to render them.
 *
 * `value` is the NOWPayments pay-currency ticker.
 */
export interface CoinOption {
  label: string
  value: string
  emoji?: string
}

export const COIN_OPTIONS: CoinOption[] = [
  { label: "Bitcoin", value: "btc", emoji: "<:bitcoin:1516911144001081525>" },
  { label: "Ethereum", value: "eth", emoji: "<:ethereum:1516911613980967123>" },
  { label: "Litecoin", value: "ltc", emoji: "<:litecoin:1516911166029431016>" },
  { label: "Solana", value: "sol", emoji: "<:SolanaPhotoroom:1516911448457085098>" },
  { label: "USDT", value: "usdttrc20", emoji: "<:USDTPhotoroom:1516911538277974157>" },
  { label: "Monero", value: "xmr", emoji: "<:Monero:1516911185734406168>" },
  { label: "BNB", value: "bnbbsc", emoji: "<:BNBPhotoroom:1516911395910848684>" },
]

export function coinLabel(value: string): string {
  return COIN_OPTIONS.find((c) => c.value === value)?.label ?? value.toUpperCase()
}
