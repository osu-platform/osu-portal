import { useQuery } from "@tanstack/react-query"
import { lessonApiClient } from "./lessonApi"

export const lessonKeys = {
  all: ["lesson"] as const,
  tests: (group: string) => [...lessonKeys.all, "tests", group],
}

export function useTestsByGroup(group: string | null) {
  return useQuery({
    queryKey: lessonKeys.tests(group ?? ""),
    queryFn: async ({ signal }) => lessonApiClient.getTests(group!, signal),
    enabled: !!group,
  })
}
