import { getModuleApiClient, getSdk } from "@portal/module-sdk"
import type { ApiClient } from "@portal/shared-api"
// import { LessonFetchEntrySchema } from "../model/types"
// import type { LessonFetchEntry } from "../model/schemas"
// function sortByDate(entries: LessonFetchEntry): LessonFetchEntry {
//   const byDate: Record<string, LessonFetchEntry> = {}
//   for (const item of entries) {
//     if (!byDate[item.REALDAY]) byDate[item.REALDAY] = []
//     byDate[item.REALDAY].push(item)
//   }
//   for (const date in byDate) {
//     byDate[date].sort((a, b) => Number(a.NUM_PARE) - Number(b.NUM_PARE))
//   }
//   return Object.keys(byDate)
//     .sort((a, b) => Number(new Date(a)) - Number(new Date(b)))
//     .flatMap((d) => byDate[d])
// }


export class LessonApiClient {
  constructor(private readonly http: ApiClient) {}

  /**
   * Приватный метод, который заменяет бэкенд-прокси.
   * Делает запрос, декодирует koi8-r и исправляет сломанный JSON.
   */
  private async _fetchOsuData(
    queryParams: Record<string, string>,
    signal?: AbortSignal
  ): Promise<any> {
    // Делаем запрос, требуя сырые байты (arraybuffer) для ручного декодирования
    const res = await this.http.get<ArrayBuffer>("", {
      params: { bot: "1", ...queryParams },
      responseType: "arraybuffer",
      signal,
    })

    // 1. Декодируем из KOI8-R (используем встроенный браузерный API)
    const decoder = new TextDecoder("koi8-r")
    const text = decoder.decode(res.data)

    // 2. Очищаем JSON (объединенная логика с бэка и фронта)
    const cleanedText = text
      .replace(/&#8470;/g, "№") // спецсимвол №
      .replace(/([{,]\s*)'([^']*)'\s*:/g, '$1"$2":') // ключи в двойные кавычки
      .replace(/:\s*'([^']*)'/g, ': "$1"') // значения в двойные кавычки
      .replace(/,\s*([}\]])/g, "$1") // удаляем висящие запятые
      // Специфичные фиксы фронтенда
      .replace(/"params":\s*"\{[^}]*\}"/g, '"params": {}')
      .replaceAll(
        '"Центр дополнительного образования "Прогресс""',
        '"Центр дополнительного образования \\"Прогресс\\""'
      )
      .replaceAll('"ЦДО "Прогресс""', '"ЦДО \\"Прогресс\\""')
      .replaceAll('Стадион "Прогресс"', "Стадион Прогресс")

    // 3. Парсим JSON
    let data
    try {
      data = JSON.parse(cleanedText)
    } catch (e) {
      // Если распарсить не удалось, возвращаем как текст (сохраняем поведение прокси)
      return cleanedText
    }

    // 4. Обрабатываем вложенные params, если они остались строками (логика с бэка)
    if (data && Array.isArray(data.list)) {
      data.list = data.list.map((item: any) => {
        if (item.params && typeof item.params === "string") {
          try {
            const cleanedParams = item.params
              .replace(/([{,]\s*)'([^']*)'\s*:/g, '$1"$2":')
              .replace(/:\s*'([^']*)'/g, ': "$1"')
              .replace(/,\s*([}\]])/g, "$1")
            item.params = JSON.parse(cleanedParams)
          } catch {}
        }
        return item
      })
    }

    return data
  }

  async getTests(group: string, signal: AbortSignal): Promise<unknown | null> {
    // ?what=3&group=16636&bot=1
    return this._fetchOsuData(
      {
        what: "3",
        filial: "1",
        group,
        mode: "full",
      },
      signal
    )
  }
}

/**
 * The client is built on first use, not at import time: the base URL comes from
 * the host's config through the SDK, and in the DevKit that client is the
 * offline mock. Eager construction would freeze the live URL into the bundle
 * before any host had a say.
 */
let instance: LessonApiClient | null = null

function client(): LessonApiClient {
  if (!instance) {
    instance = new LessonApiClient(
      getModuleApiClient(getSdk().config.schedulePagesUrl)
    )
  }
  return instance
}

export const lessonApiClient = new Proxy({} as LessonApiClient, {
  get: (_target, prop) => Reflect.get(client(), prop, client()),
})
