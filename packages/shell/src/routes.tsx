/**
 * Portal routes — the storefront's own pages.
 *
 * Module routes are not listed here: the registry contributes them at runtime,
 * so this table stays the same no matter which modules a build contains.
 */

import { Navigate } from "react-router-dom"
import { lazyPage, type RouteConfig } from "@portal/runtime"
import { PATHS } from "./paths"

// ─── Lazy components (created once at module level) ──────────────────────────

const LoginPage = lazyPage(() => import("./auth/LoginPage"))
const RegisterPage = lazyPage(() => import("./auth/RegisterPage"))
const ForgotPasswordPage = lazyPage(() => import("./auth/ForgotPasswordPage"))
const OnboardingVerifyPage = lazyPage(
  () => import("./onboarding/OnboardingVerifyPage")
)
const OnboardingCompletePage = lazyPage(
  () => import("./onboarding/OnboardingCompletePage")
)
const HomePage = lazyPage(() => import("./home/HomePage"), "HomePage")
const SettingsPage = lazyPage(
  () => import("./settings/SettingsPage"),
  "SettingsPage"
)
const NotFoundPage = lazyPage(
  () => import("./not-found/NotFoundRoute"),
  "NotFoundRoute"
)

// ─── Portal Routes ───────────────────────────────────────────────────────────

export const portalRoutes: RouteConfig[] = [
  // The storefront works independently of optional modules.
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
    meta: { guard: "public" },
  },

  // ── Guest-only (login, register, etc.) ─────────────────────────────────────
  {
    path: PATHS.login,
    component: LoginPage,
    meta: { guard: "guest", title: "Вход" },
  },
  {
    path: PATHS.register,
    component: RegisterPage,
    meta: { guard: "guest", title: "Регистрация" },
  },
  {
    path: PATHS.forgotPassword,
    component: ForgotPasswordPage,
    meta: { guard: "guest", title: "Восстановление пароля" },
  },

  // ── Onboarding ─────────────────────────────────────────────────────────────
  {
    path: PATHS.onboarding,
    element: <Navigate to={PATHS.onboardingVerify} replace />,
    meta: { guard: "onboarding" },
  },
  {
    path: PATHS.onboardingVerify,
    component: OnboardingVerifyPage,
    meta: { guard: "onboarding", title: "Верификация" },
  },
  {
    path: PATHS.onboardingComplete,
    component: OnboardingCompletePage,
    meta: { guard: "onboarding", title: "Добро пожаловать" },
  },

  // ── Authenticated ──────────────────────────────────────────────────────────
  {
    path: PATHS.dashboard,
    component: HomePage,
    meta: { guard: "authenticated", title: "Главная" },
  },
  {
    path: PATHS.settings,
    component: SettingsPage,
    meta: { guard: "authenticated", title: "Настройки" },
  },
  {
    path: PATHS.profile,
    component: HomePage,
    meta: { guard: "authenticated", title: "Профиль" },
  },

  // ── Catch-all ──────────────────────────────────────────────────────────────
  {
    path: "*",
    component: NotFoundPage,
    meta: { guard: "public", title: "Страница не найдена" },
  },
]
