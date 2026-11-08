# @portal/shared-api

A centralized API client for the OSU Portal application. It provides standard configurations, interceptors (mock auth, error handling, retry logic), and helper functions for initializing and updating the global API client.

## Usage

```typescript
import { createApiClient, initApi } from "@portal/shared-api"

// Initialize with base URL and optional config
const api = createApiClient({
  baseUrl: "https://api.osu.edu",
  headers: {
    "X-Custom-Header": "value",
  },
})

// Or initialize the global singleton
initApi("https://api.osu.edu")
```

## Features

- **Axios-based**: Standard HTTP client behavior.
- **Interceptors**:
  - Centralized error handling.
  - Automatic retry on 401/500 errors.
  - Auth token injection (TODO).
- **TypeScript Support**: Full typing for requests and responses.

## Installation

This package is part of the monorepo workspace. Add it to your app via:

```json
"dependencies": {
  "@portal/shared-api": "workspace:*"
}
```
