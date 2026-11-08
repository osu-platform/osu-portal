/**
 * Гигиена цветовых токенов.
 *
 * Проверяет то, что раньше расползалось по проекту незаметно:
 * мёртвые префиксы переменных, обращения к необъявленным токенам
 * и цвета, вбитые мимо темы.
 *
 * Запускается вместе с обычными тестами: `pnpm test`.
 */

import { readFileSync, readdirSync } from "node:fs"
import { describe, expect, it } from "vitest"

const TOKENS_CSS = "packages/shared/ui/src/styles/tokens.css"

/**
 * Файлы под контролем: исходники, без сборок и снапшотов.
 *
 * `--others` обязателен: без него новый, ещё не добавленный в индекс файл
 * невидим — и объявленные в нём переменные выглядят как несуществующие.
 */
function sourceFiles(...patterns) {
  const extensions = patterns.map((pattern) =>
    pattern.replaceAll("'", "").slice(1)
  )
  function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (["node_modules", "dist", ".git"].includes(entry.name)) return []
      const file = dir + "/" + entry.name
      return entry.isDirectory()
        ? walk(file)
        : extensions.some((ext) => file.endsWith(ext))
          ? [file]
          : []
    })
  }
  return [...walk("apps"), ...walk("packages")]
}

const styleFiles = sourceFiles("'*.css'")
const codeFiles = sourceFiles("'*.css'", "'*.ts'", "'*.tsx'")

/** Собрать все объявленные переменные (глобальные и локальные) */
function declaredVariables() {
  const declared = new Set()

  for (const file of styleFiles) {
    const content = readFileSync(file, "utf8")

    for (const match of content.matchAll(/(--p-[a-z0-9-]+)\s*:/g)) {
      declared.add(match[1])
    }
  }

  return declared
}

describe("гигиена токенов", () => {
  it("в проекте не осталось переменных унаследованных библиотек", () => {
    const offenders = []

    for (const file of codeFiles) {
      const content = readFileSync(file, "utf8")

      // Комментарии, объясняющие миграцию, упоминать префикс вправе,
      // поэтому ищем только реальные обращения и объявления
      for (const match of content.matchAll(
        /(?:var\(|^\s*)(--(?:tgui--|portal-theme-)[a-z0-9_-]+)/gim
      )) {
        offenders.push(`${file}: ${match[1]}`)
      }
    }

    expect(offenders.join("\n")).toBe("")
  })

  it("все используемые переменные --p-* где-то объявлены", () => {
    const declared = declaredVariables()
    const offenders = []

    for (const file of codeFiles) {
      const content = readFileSync(file, "utf8")

      for (const match of content.matchAll(/var\(\s*(--p-[a-z0-9-]+)/g)) {
        // Имя, оборванное дефисом, — это документация вида `--p-color-*`
        // в комментарии, а не обращение к переменной
        if (match[1].endsWith("-")) {
          continue
        }

        if (!declared.has(match[1])) {
          offenders.push(`${file}: ${match[1]}`)
        }
      }
    }

    expect(offenders.join("\n")).toBe("")
  })

  it("цвета не вбиты мимо темы", () => {
    /**
     * Что законно оставлять цветом, а не токеном:
     * - тени и свечения: чёрный полупрозрачный при любой теме;
     * - фирменные цвета сторонних продуктов (кнопка мессенджера MAX);
     * - радуга выбора цвета — это сам предмет компонента;
     * - файл токенов, где цвета и объявляются.
     */
    const ALLOWED_FILES = [
      TOKENS_CSS,
      "packages/shared/ui/src/components/Form/ColorInput/ColorInput.module.css",
      "packages/shared/ui/src/components/utilities/MaxButton/MaxButton.module.css",
      // Стеклянный таббар: подобранная вручную полупрозрачная подложка,
      // токенами не выражается
      "packages/shared/ui/src/components/navigation/AppleTabbar/AppleTabbar.module.css",
    ]

    const SHADOW_PROPERTIES = /^\s*(box-shadow|text-shadow|filter|--\w[\w-]*)/

    const offenders = []

    for (const file of styleFiles) {
      if (ALLOWED_FILES.includes(file)) {
        continue
      }

      const lines = readFileSync(file, "utf8").split("\n")

      lines.forEach((line, index) => {
        // Тени и продолжения многострочных теней пропускаем
        if (SHADOW_PROPERTIES.test(line) || /^\s+0\s/.test(line)) {
          return
        }

        // Полностью прозрачный цвет — это «ничего», а не решение о цвете:
        // встречается как начальная точка градиента
        if (/rgba?\(\s*[\d\s,]*,\s*0\s*\)/.test(line)) {
          return
        }

        const match = line.match(/(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\))/)

        if (match && !line.trimStart().startsWith("*")) {
          offenders.push(`${file}:${index + 1}: ${match[1]}`)
        }
      })
    }

    expect(offenders.join("\n")).toBe("")
  })
})
