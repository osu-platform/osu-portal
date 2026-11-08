import { create } from "zustand"
import { type ViewSharedDataStore } from "./types"

const useViewSharedDataStore = create<ViewSharedDataStore>()((set) => ({
  viewTitle: "",
  setViewTitle: (title: string) => set({ viewTitle: title }),

  onSearch: () => {},
  setOnSearch: (handler: () => void) => {
    set({ onSearch: handler })
  },
}))

export default useViewSharedDataStore
