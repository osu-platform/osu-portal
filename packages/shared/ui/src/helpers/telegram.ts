import { canUseDOM } from "helpers/dom"

interface TelegramWebAppData {
  platform: string
  colorScheme: "light" | "dark"
  themeParams: Record<string, string>
  onEvent(eventType: string, handler: () => void): void
  offEvent(eventType: string, handler: () => void): void
}

export const getTelegramData = (): TelegramWebAppData | undefined => {
  if (!canUseDOM) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp as TelegramWebAppData | undefined
}
