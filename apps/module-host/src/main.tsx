/**
 * Entry point of the isolated host.
 */

import React from "react"
import ReactDOM from "react-dom/client"
import { initRuntime } from "@portal/shared-platform"
import { bootstrapApp } from "@portal/runtime"
import { App } from "./app/App"
import "./styles.css"

initRuntime().then(() => bootstrapApp())

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
