// ======= inferred types ========

import z from "zod"
import {
  FacultyParamsSchema,
  FacultiesItemSchema,
  FacultiesFetchSchema,
  LessonFetchItemEntrySchema,
  LessonFetchEntrySchema,
  FacultySchema,
  FacultiesSchema,
  LessonGroupSchema,
  LessonSubjectSchema,
  LessonTeacherSchema,
  LessonRoomSchema,
  LessonTypeSchema,
  LessonSessionSchema,
  LessonEntitySchema,
} from "./types"

export type FacultyParams = z.infer<typeof FacultyParamsSchema>
export type FacultiesItem = z.infer<typeof FacultiesItemSchema>
export type FacultiesFetch = z.infer<typeof FacultiesFetchSchema>
export type LessonFetchItemEntry = z.infer<typeof LessonFetchItemEntrySchema>
export type LessonFetchEntry = z.infer<typeof LessonFetchEntrySchema>

export type Faculty = z.infer<typeof FacultySchema>
export type Faculties = z.infer<typeof FacultiesSchema>
export type LessonGroup = z.infer<typeof LessonGroupSchema>
export type LessonSubject = z.infer<typeof LessonSubjectSchema>
export type LessonTeacher = z.infer<typeof LessonTeacherSchema>
export type LessonRoom = z.infer<typeof LessonRoomSchema>
export type LessonType = z.infer<typeof LessonTypeSchema>
export type LessonSession = z.infer<typeof LessonSessionSchema>
export type LessonEntity = z.infer<typeof LessonEntitySchema>
