import useViewSharedDataStore from "./store"

const useViewTitle = () => {
  const viewTitle = useViewSharedDataStore((state) => state.viewTitle)
  return viewTitle
}

const useViewOnSerchAction = () => {
  const onSearch = useViewSharedDataStore((state) => state.onSearch)
  return onSearch
}

export { useViewTitle, useViewOnSerchAction }
