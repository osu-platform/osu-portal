import type {
  FacultiesItem,
  FacultiesFetch,
  LessonFetchItemEntry,
  Faculty,
  Faculties,
  LessonEntity,
} from "./schemas"

import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)

const MONTH_MAP: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
}

function parseDay(day: string): string {
  // "24-JAN-26" → "2026-01-24"
  const [d, m, y] = day.split("-")
  const month = MONTH_MAP[m]
  const year = `20${y}`
  return `${year}-${month}-${d.padStart(2, "0")}`
}

export class FacultyMapper {
  static fromItem(item: FacultiesItem): Faculty {
    return {
      id: item.id,
      title: item.title,
      name: item.name,
      params: {
        filial: item.params.filial,
        mode: item.params.mode,
        bot: item.params.bot,
        facult: item.params.facult,
      },
    }
  }

  static fromFetch(fetch: FacultiesFetch): Faculties {
    return {
      who: fetch.who,
      what: fetch.what,
      request: fetch.request,
      list: fetch.list.map(FacultyMapper.fromItem),
    }
  }
}

export class LessonMapper {
  static fromEntry(entry: LessonFetchItemEntry): LessonEntity {
    return {
      group: {
        code: entry.KODGROUP,
        name: entry.NAMEGROUP,
        specCode: entry.KODSPEC,
        stream: entry.POTOK,
        course: entry.KURS,
        subgroupNum: entry.NUM_PODGR,
        subgroupUnion: entry.NUM_UNION,
        subgroupCount: entry.COUNT_PODGR_ALL,
        subgroupAbbr: entry.ABBR_DESCR_PODGRS,
        subgroupName: entry.NAME_DESCR_PODGRS,
      },
      subject: {
        code: entry.KODSUBJ,
        name: entry.NAMESUBJ,
        shortName: entry.SHORT_NAME_SUB,
      },
      teacher: {
        id: entry.MAN_ID,
        fio: entry.FIO,
        fioShort: entry.FIO_SOKR,
      },
      room: {
        id: entry.ROOM_ID,
        name: entry.AUD_ALL_LPAD,
      },
      type: {
        id: entry.TYPEZAN_ID,
        name: entry.TYPEZAN_NAME,
        shortName: entry.TYPEZAN_SHORT_NAME,
      },
      session: {
        typeId: entry.ID_TYPESESS,
        typeName: entry.NAME_TYPE_SESS,
        semesterType: entry.TYPE_SEM_CUR,
        semesterName: entry.NAME_TYPE_SEM,
      },
      pairNum: entry.NUM_PARE,
      day: entry.DAY,
      realDay: entry.REALDAY
        ? entry.REALDAY.split(".").reverse().join("-")
        : parseDay(entry.DAY),
      description: entry.DESCRIPTION,
      yearCurrent: entry.YEAR_CUR,
      filialCode: entry.KODFILIAL,
      departmentCode: entry.KODOTDEL,
      isExtramural: entry.ISZAOCHN,
      carryFrom: entry.CARRY_FROM,
    }
  }

  static fromEntries(entries: LessonFetchItemEntry[]): LessonEntity[] {
    return entries.map(LessonMapper.fromEntry)
  }
}
