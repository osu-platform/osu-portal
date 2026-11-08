/**
 * Offline fixtures for the schedule module.
 *
 * They live inside the module rather than inside the DevKit on purpose: they
 * travel with the module, so a contributor who copies the module gets working
 * fixtures, and they double as test data for the module's own tests.
 *
 * The host passes these to createMockSdk() — see apps/module-host.
 */

import type { MockHandler, MockRequest } from "@portal/module-sdk/mock"
import dayjs from 'dayjs'

// ─── KOI8-R encoding ─────────────────────────────────────────────────────────
// The upstream schedule pages are served in KOI8-R and the client decodes raw
// bytes, so a fixture has to be bytes too — otherwise the mock would exercise
// a different code path than production. The browser has a KOI8-R decoder but
// no encoder, so we derive the reverse table from the decoder once.

let koi8Table: Map<string, number> | null = null

function koi8Encoder(): Map<string, number> {
  if (koi8Table) return koi8Table
  const table = new Map<string, number>()
  const decoder = new TextDecoder("koi8-r")
  for (let byte = 0; byte < 256; byte++) {
    const char = decoder.decode(new Uint8Array([byte]))
    if (!table.has(char)) table.set(char, byte)
  }
  koi8Table = table
  return table
}

export function encodeKoi8(text: string): ArrayBuffer {
  const table = koi8Encoder()
  const bytes = new Uint8Array(text.length)
  for (let i = 0; i < text.length; i++) {
    // "?" for anything KOI8-R cannot represent — fixtures stay readable.
    bytes[i] = table.get(text[i]) ?? 0x3f
  }
  return bytes.buffer
}

const koi8Json = (value: unknown): ArrayBuffer =>
  encodeKoi8(JSON.stringify(value))

// ─── Fixture data ────────────────────────────────────────────────────────────

const DEMO_GROUP = "ДЕМО-01"

function lesson(overrides: Record<string, string>) {
  return {
    KODGROUP: "1001",
    NAMEGROUP: DEMO_GROUP,
    KODSPEC: "09.03.02",
    POTOK: "1",
    NAMESUBJ: "Информационные технологии",
    KODSUBJ: "2001",
    SHORT_NAME_SUB: "ИТ",
    ROOM_ID: "217",
    AUD_ALL_LPAD: "2-217",
    TYPEZAN_NAME: "Лекционное занятие",
    TYPEZAN_ID: "1",
    TYPEZAN_SHORT_NAME: "Лек",
    DESCRIPTION: "",
    NUM_PARE: "3",
    DAY: "1",
    FIO: "Демонстрационный преподаватель",
    MAN_ID: "501",
    NUM_PODGR: "0",
    NUM_UNION: "0",
    COUNT_PODGR_ALL: "1",
    KURS: "1",
    FIO_SOKR: "Преподаватель Д.",
    YEAR_CUR: "2026",
    TYPE_SEM_CUR: "1",
    KODOTDEL: "1",
    ISZAOCHN: "0",
    ID_TYPESESS: "1",
    NAME_TYPE_SESS: "Экзаменационная сессия",
    NAME_TYPE_SEM: "Осенний семестр",
    KODFILIAL: "1",
    CARRY_FROM: "",
    ABBR_DESCR_PODGRS: "",
    NAME_DESCR_PODGRS: "",
    REALDAY: dayjs().format('YYYY-MM-DD'),
    ...overrides,
  }
}

const DEMO_LESSONS = [
  lesson({}),
  lesson({
    NAMESUBJ: "Математический анализ",
    SHORT_NAME_SUB: "МатАн",
    NUM_PARE: "4",
    AUD_ALL_LPAD: "3-405",
    TYPEZAN_NAME: "Практическое занятие",
    TYPEZAN_SHORT_NAME: "Пр",
    FIO_SOKR: "Преподаватель Д2.",
    FIO: "Демонстрационный преподаватель 2",
  }),
  lesson({
    NAMESUBJ: "Иностранный язык",
    SHORT_NAME_SUB: "ИнЯз",
    NUM_PARE: "2",
    REALDAY: dayjs().add(1,'day').format('YYYY-MM-DD'),
    AUD_ALL_LPAD: "1-108",
    FIO_SOKR: "Преподаватель Д3.",
    FIO: "Демонстрационный преподаватель 3",
  }),
]

const DEMO_FACULTIES = {
  who: "1",
  what: "3",
  request: "facult",
  list: [
    {
      id: "1",
      title: "Факультет математики и информационных технологий",
      name: "ФМиИТ",
      params: { filial: "1", mode: "full", bot: "1", facult: "1" },
    },
  ],
}

const DEMO_GROUPS = {
  who: "1",
  what: "3",
  request: "group",
  list: [
    {
      id: "1001",
      title: DEMO_GROUP,
      name: DEMO_GROUP,
      params: { filial: "1", mode: "full", bot: "1", facult: "1" },
    },
  ],
}

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * Fixtures covering every backend the module talks to.
 * Anything not listed here fails loudly in the DevKit — which is the point:
 * an uncovered call must be visible, not silently online.
 */
export function createMockHandlers(): MockHandler[] {
  return [
    // Legacy schedule pages (KOI8-R byte responses)
    {
      url: /schedule-pages/,
      response: ({ params }: MockRequest) => {
        const query = (params ?? {}) as Record<string, string>
        if (query.request === "facult") return koi8Json(DEMO_FACULTIES)
        if (query.potok || query.request === "group") return koi8Json(DEMO_GROUPS)
        if (query.request === "korpus")
          return koi8Json({ who: "3", what: "3", request: "korpus", list: [] })
        return koi8Json(DEMO_LESSONS)
      },
    },

    // Preferences service
    {
      method: "get",
      url: /\/api\/v1\/preferences/,
      response: {
        favorites: [
          {
            id: 1,
            created_at: "2026-01-01T00:00:00Z",
            target: {
              id: 1,
              type: "group",
              external_id: "1001",
              name: DEMO_GROUP,
            },
          },
        ],
        default_schedule: null,
      },
    },
    {
      url: /\/api\/v1\/preferences/,
      response: { ok: true },
    },

    // Subscriptions service
    { method: "get", url: /\/api\/v1\/subscriptions/, response: [] },
    {
      url: /\/api\/v1\/subscriptions/,
      response: (request: MockRequest) => ({
        id: 1,
        ...(request.data as object),
      }),
    },
  ]
}
