import { z } from "zod"

// ======= fetch schemas ========

export const FacultyParamsSchema = z.object({
  filial: z.string(),
  mode: z.string(),
  bot: z.string(),
  facult: z.string(),
})

export const FacultiesItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  name: z.string(),
  params: FacultyParamsSchema,
})

export const FacultiesFetchSchema = z.object({
  who: z.string(),
  what: z.string(),
  request: z.string(),
  list: z.array(FacultiesItemSchema),
})

export const LessonFetchItemEntrySchema = z.object({
  KODGROUP: z.string(),
  NAMEGROUP: z.string(),
  KODSPEC: z.string(),
  POTOK: z.string(),
  NAMESUBJ: z.string(),
  KODSUBJ: z.string(),
  SHORT_NAME_SUB: z.string(),
  ROOM_ID: z.string(),
  AUD_ALL_LPAD: z.string(),
  TYPEZAN_NAME: z.string(),
  TYPEZAN_ID: z.string(),
  TYPEZAN_SHORT_NAME: z.string(),
  DESCRIPTION: z.string(),
  NUM_PARE: z.string(),
  DAY: z.string(),
  FIO: z.string(),
  MAN_ID: z.string(),
  NUM_PODGR: z.string(),
  NUM_UNION: z.string(),
  COUNT_PODGR_ALL: z.string(),
  KURS: z.string(),
  FIO_SOKR: z.string(),
  YEAR_CUR: z.string(),
  TYPE_SEM_CUR: z.string(),
  KODOTDEL: z.string(),
  ISZAOCHN: z.string(),
  ID_TYPESESS: z.string(),
  NAME_TYPE_SESS: z.string(),
  NAME_TYPE_SEM: z.string(),
  KODFILIAL: z.string(),
  CARRY_FROM: z.string(),
  ABBR_DESCR_PODGRS: z.string(),
  NAME_DESCR_PODGRS: z.string(),
  REALDAY: z.string().optional().default(""),
})

export const LessonFetchEntrySchema = z.array(LessonFetchItemEntrySchema)

// ======= entity schemas ========

export const FacultySchema = z.object({
  id: z.string(),
  title: z.string(),
  name: z.string(),
  params: FacultyParamsSchema,
})

export const FacultiesSchema = z.object({
  who: z.string(),
  what: z.string(),
  request: z.string(),
  list: z.array(FacultySchema),
})

export const LessonGroupSchema = z.object({
  code: z.string(),
  name: z.string(),
  specCode: z.string(),
  stream: z.string(),
  course: z.string(),
  subgroupNum: z.string(),
  subgroupUnion: z.string(),
  subgroupCount: z.string(),
  subgroupAbbr: z.string(),
  subgroupName: z.string(),
})

export const LessonSubjectSchema = z.object({
  code: z.string(),
  name: z.string(),
  shortName: z.string(),
})

export const LessonTeacherSchema = z.object({
  id: z.string(),
  fio: z.string(),
  fioShort: z.string(),
})

export const LessonRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const LessonTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
})

export const LessonSessionSchema = z.object({
  typeId: z.string(),
  typeName: z.string(),
  semesterType: z.string(),
  semesterName: z.string(),
})

export const LessonEntitySchema = z.object({
  group: LessonGroupSchema,
  subject: LessonSubjectSchema,
  teacher: LessonTeacherSchema,
  room: LessonRoomSchema,
  type: LessonTypeSchema,
  session: LessonSessionSchema,
  pairNum: z.string(),
  day: z.string(),
  realDay: z.string(),
  description: z.string(),
  yearCurrent: z.string(),
  filialCode: z.string(),
  departmentCode: z.string(),
  isExtramural: z.string(),
  carryFrom: z.string(),
})

// ====== teacher ======

export const TeacherParamsSchema = z.object({
  filial: z.string(),
  mode: z.string(),
  bot: z.string(),
  kafedra: z.string(),
  facult: z.string(),
  prep: z.string(),
})

export const TeacherEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  name: z.string(),
  params: z.string(), // В API передается как строка
})

export const TeachersFetchSchema = z.object({
  who: z.string(),
  what: z.string(),
  request: z.string(),
  list: z.array(TeacherEntrySchema),
})

export type TeacherEntry = z.infer<typeof TeacherEntrySchema>
export type TeachersFetch = z.infer<typeof TeachersFetchSchema>

// ====== audience ======

export interface AudienceFetchItem {
  KOD_DAY_OF_WEEK: string
  NAME_DAY: string
  DOW_ABBREV: string
  KOD_TYPE_WEEK: string
  DAY: string
  RC_ID: string
  ID_PGD: string
  ID_SETKI: string
  NUM_PARE: string
  DESCRIPTION: string
  TEACHER_ID: string
  NAMEGROUP: string
  KODGROUP: string
  NUM_PODGR: string
  ID_SUBJ: string
  NAMESUBJ: string
  SHORT_NAME_SUBJ: string
  ID_TYPE_ZAN: string
  TZ_SHORT_NAME: string
  NUM_UNION: string
  POTOKABBREV: string
  YEARPOTOK: string
  COUNT_PODGR_ALL: string
  MAN_ID: string
  FIO: string
  FIO_SOKR: string
  KOD_REESTR: string
  AUD_ALL: string
  ABBR_DESCR_PODGRPS: string
  NAME_DESCR_PODGRPS: string
}

export interface AudienceEntity {
  kodDayOfWeek: string
  nameDay: string
  dowAbbrev: string
  kodTypeWeek: string
  day: string
  rcId: string
  idPgd: string
  idSetki: string
  numPare: string
  description: string
  teacherId: string
  nameGroup: string
  kodGroup: string
  numPodgr: string
  idSubj: string
  nameSubj: string
  shortNameSubj: string
  idTypeZan: string
  tzShortName: string
  numUnion: string
  potokAbbrev: string
  yearPotok: string
  countPodgrAll: string
  manId: string
  fio: string
  fioSokr: string
  kodReestr: string
  audAll: string
  abbrDescrPodgrps: string
  nameDescrPodgrps: string
}
