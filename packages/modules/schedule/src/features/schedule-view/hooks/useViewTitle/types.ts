export type ViewSharedDataStore = {
  viewTitle: string
  setViewTitle: (title: string) => void

  onSearch: () => void
  setOnSearch: (handler: () => void) => void
}
