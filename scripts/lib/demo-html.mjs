/** Offline profile has no external script/font requests; live keeps platform SDK tags. */
export function demoHtml(env) {
  return {
    name: "portal-demo-html",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const defaults = {
          VITE_APP_NAME: "Портал ОГУ",
          VITE_APP_DESCRIPTION: "Демонстрация студенческого портала",
          VITE_APP_THEME_COLOR: "#004F9F",
        }
        let result = html.replace(
          /%(VITE_APP_NAME|VITE_APP_DESCRIPTION|VITE_APP_THEME_COLOR)%/g,
          (_, name) => env[name] || defaults[name]
        )
        if (env.VITE_DATA_PROFILE !== "live")
          result = result
            .replace(/<script[^>]+src="https?:[^>]+><\/script>/g, "")
            .replace(/<link[^>]+(?:https?:|fonts\.)[^>]*>/g, "")
        return result
      },
    },
  }
}
