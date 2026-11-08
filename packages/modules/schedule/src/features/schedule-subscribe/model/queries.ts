import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSdkUser } from "@portal/module-sdk"
import {
  subscriptionApi,
  type CreateSubscriptionParams,
  type UpdateSubscriptionParams,
} from "../api/subscriptionApi"

/**
 * Identity comes from the host through the SDK — the module never reads
 * platform globals and never assumes which messenger it runs in. That is what
 * makes it debuggable in the DevKit and portable to another platform.
 */
function usePlatformIdentity() {
  const { platformUserId, platform } = useSdkUser()
  return { userId: platformUserId, platform }
}

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  list: (userId: string) => [...subscriptionKeys.all, userId] as const,
}

export function useSubscriptionsQuery() {
  const { userId, platform } = usePlatformIdentity()
  return useQuery({
    queryKey: userId ? subscriptionKeys.list(userId) : subscriptionKeys.all,
    queryFn: () => subscriptionApi.list(platform, userId!),
    enabled: !!userId,
    staleTime: 30_000,
  })
}

export function useCreateSubscriptionMutation() {
  const queryClient = useQueryClient()
  const { userId, platform } = usePlatformIdentity()
  return useMutation({
    mutationFn: (
      params: Omit<CreateSubscriptionParams, "platform" | "platform_user_id">
    ) => {
      if (!userId)
        return Promise.reject(new Error("Пользователь платформы недоступен"))
      return subscriptionApi.create({
        platform,
        platform_user_id: userId,
        ...params,
      })
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.list(userId) })
      }
    },
  })
}

export function useUpdateSubscriptionMutation() {
  const queryClient = useQueryClient()
  const { userId } = usePlatformIdentity()
  return useMutation({
    mutationFn: ({
      id,
      params,
    }: {
      id: number
      params: UpdateSubscriptionParams
    }) => subscriptionApi.update(id, params),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.list(userId) })
      }
    },
  })
}

export function useDeleteSubscriptionMutation() {
  const queryClient = useQueryClient()
  const { userId } = usePlatformIdentity()
  return useMutation({
    mutationFn: (id: number) => subscriptionApi.delete(id),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.list(userId) })
      }
    },
  })
}
