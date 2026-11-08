/**
 * Default Back Button Adapter
 *
 * Хост без своей шапки — браузер, PWA, изолированный DevKit-хост. Кнопки «назад» у него
 * нет, и подделывать её нечем: рисовать свою поверх страницы значит спорить с браузерной
 * кнопкой и с жестом «назад». `isSupported()` отвечает `false`, экраны показывают
 * собственную кнопку — ровно то поведение, что было до появления адаптера.
 */

import type { BackButtonAdapter } from "../base"

export const createDefaultBackButtonAdapter = (): BackButtonAdapter => ({
  isSupported: () => false,
  show: () => {},
  hide: () => {},
  onClick: () => {},
  offClick: () => {},
})
