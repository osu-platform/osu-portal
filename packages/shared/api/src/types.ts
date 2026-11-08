export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

/** Body shape emitted by `DomainError` handlers in the backend (see
 *  `backend/src/events_app/web/app.py`). */
export interface DomainErrorBody {
  error: { code: string; message: string }
}

/** Body shape FastAPI itself emits for HTTPException / validation errors, when
 *  a request never reaches a `DomainError`-raising service call. */
export interface FastApiErrorBody {
  detail: string | { msg?: string }[]
}
