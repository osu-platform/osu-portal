// TODO: ВРЕМЕННО ПРОПИШИ ТАМ TODO И ПОКА ЭТО НЕ РЕАЛИЗОВЫВАЙ! ЭТО БУДЕТ ПОЗЖЕ!
// auth.ts – добавление токена авторизации к каждому запросу. Токен берётся из переданного объекта Auth (не напрямую из LocalStorage).
import { AxiosInstance } from "axios"

export const attachAuthInterceptor = (
  instance: AxiosInstance,
  _auth: unknown
) => {
  // TODO: Implement later
  instance.interceptors.request.use(
    (config) => {
      // Logic to attach token from `auth` object
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}
