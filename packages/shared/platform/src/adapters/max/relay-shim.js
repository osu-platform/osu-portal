/**
 * max-relay-shim — пропуск сообщений релея через фильтр origin в SDK мини-приложений.
 *
 * ЗАЧЕМ
 *
 * Клиент-мессенджер принимает события моста только от origin, зарегистрированного за ботом.
 * Если приложение открыто с другого домена (стенды, несколько ботов на одном хосте, локальная
 * отладка), его сообщения молча выбрасываются. Лечится это релеем: страница на
 * зарегистрированном origin держит приложение во вложенном iframe и перекладывает сообщения.
 *
 * Наверх это работает само — SDK шлёт в `window.parent`, а это релей. А вниз SDK отбрасывает
 * всё, что пришло не от клиента:
 *
 *   _ = /^https:\/\/.*\.(?:max|oneme)\.ru$/
 *   if (!(!_.test(e.origin) || typeof e.data != "string")) ...
 *
 * Под нож попадают ответы на все запросы и события — в случае MAX включая
 * `WebAppBackButtonPressed`, из-за чего кнопка «назад» рисуется, но не нажимается.
 *
 * КАК
 *
 * Сам регекс не переопределить: он в области видимости модуля SDK. Но событие, которое SDK
 * примет, можно не перехватывать, а создать — `MessageEvent` разрешает задать `origin` в
 * конструкторе. Слушаем сообщения релея и передиспетчим их с origin, который фильтр проходит.
 *
 * Так SDK остаётся нетронутым и тянется с адреса мессенджера, всегда актуальный.
 *
 * ПОДКЛЮЧЕНИЕ
 *
 *   <script src="https://ваш-релей.example/max-relay-shim.js"></script>
 *   <script src="https://st.max.ru/js/max-web-app.js"></script>
 *
 * По умолчанию шим доверяет тому origin, с которого загружен сам, — то есть релею. Отдельно
 * настраивать нечего, а когда релей уйдёт, достаточно удалить одну строку.
 *
 * Это не ослабление безопасности: подключая скрипт с домена X, страница уже отдала X полный
 * контроль над собой. Разрешить X ещё и слать сообщения мосту — строго меньше того, что тег
 * `<script>` открыл и так.
 *
 * НАСТРОЙКА (нужна редко)
 *
 *   data-trust-origins  список доверенных origin через запятую, если релей и хранилище
 *                       скрипта разнесены. Заменяет собой значение по умолчанию.
 *   data-as-origin      origin, под которым передиспетчим; должен проходить фильтр
 *                       конкретного SDK. По умолчанию https://web.max.ru
 *
 * ОГРАНИЧЕНИЯ
 *
 * Подключать обычным синхронным тегом: самонастройка держится на `document.currentScript`,
 * который у `async`/`type=module` равен null. Ставить до SDK не обязательно, но нужно до
 * первого обращения к мосту.
 *
 * Телефон трогать не нужно и вредно: там клиент инжектит нативный мост в WebView, origin не
 * проверяется, и релей с iframe только ломает рабочий путь. Релею полагается уходить на
 * телефоне обычным редиректом, и тогда этот шим просто ничего не делает.
 */
;(function () {
  "use strict"

  var script = document.currentScript
  if (!script) {
    console.warn(
      "[max-relay-shim] Не найден собственный тег: подключайте обычным <script>, без async и type=module."
    )
    return
  }

  // Двойная установка раздвоила бы каждое сообщение: ответ на запрос пришёл бы дважды, а
  // нажатие «назад» сработало бы за два экрана сразу.
  if (window.__maxRelayShimInstalled) return
  window.__maxRelayShimInstalled = true

  var ownOrigin
  try {
    ownOrigin = new URL(script.src, window.location.href).origin
  } catch (error) {
    console.warn("[max-relay-shim] Не удалось определить свой origin:", error)
    return
  }

  var configured = script.dataset.trustOrigins
  var trusted = (configured ? configured.split(",") : [ownOrigin])
    .map(function (origin) {
      return origin.trim()
    })
    .filter(Boolean)

  // Со звёздочкой шим доверял бы любому фрейму, включая чужой, — это ровно та дыра, от
  // которой фильтр SDK и защищает. Лучше не завестись, чем завестись нараспашку.
  if (trusted.indexOf("*") !== -1 || trusted.length === 0) {
    console.warn("[max-relay-shim] data-trust-origins должен содержать явные origin, не «*».")
    return
  }

  var acceptedOrigin = script.dataset.asOrigin || "https://web.max.ru"

  window.addEventListener("message", function (event) {
    if (trusted.indexOf(event.origin) === -1) return
    // Релей — наш родитель. Сообщение с его origin из любого другого окна нам не адресовано.
    if (event.source !== window.parent) return
    if (typeof event.data !== "string") return

    // Пересобранное событие придёт и сюда, но с origin клиента, а не релея — первая же
    // проверка его отсеет, зацикливания нет.
    window.dispatchEvent(
      new MessageEvent("message", { data: event.data, origin: acceptedOrigin })
    )
  })
})()
