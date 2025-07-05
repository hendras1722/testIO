import api from '@/utils/axios'
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

type ApiOptions<TResponse, TBody = unknown> = {
  url: string
  method?: HttpMethod
  body?: TBody
  queryKey?: readonly unknown[]
  enabled?: boolean
  autoRefetchOnWindowFocus?: boolean
  staleTime?: number
  onSuccess?: (data: TResponse) => void
  onError?: (error: Error) => void
}

function urlToQueryKey(url: string): string[] {
  const [pathname, search] = url.split('?')
  return search ? [pathname, search] : [pathname]
}

export function useApi<TResponse, TBody = unknown>(
  options: ApiOptions<TResponse, TBody>
): TBody extends undefined
  ? UseQueryResult<TResponse, Error>
  : UseMutationResult<TResponse, Error, TBody> {
  const {
    url,
    method = 'GET',
    body,
    queryKey,
    enabled = true,
    autoRefetchOnWindowFocus = false,
    staleTime = 0,
  } = options

  const queryClient = useQueryClient()
  const key = queryKey || urlToQueryKey(url)

  if (method === 'GET') {
    return useQuery<TResponse, Error>({
      queryKey: key,
      queryFn: async () => {
        const res = await api.get(url)
        return res.data
      },
      enabled,
      staleTime,
      refetchOnWindowFocus: autoRefetchOnWindowFocus,
    }) as any
  }

  return useMutation<TResponse, Error, TBody>({
    mutationFn: async (data) => {
      const payload = data ?? body
      switch (method) {
        case 'POST':
          return (await api.post(url, payload)).data
        case 'PUT':
          return (await api.put(url, payload)).data
        case 'PATCH':
          return (await api.patch(url, payload)).data
        case 'DELETE':
          return (await api.delete(url)).data
        default:
          throw new Error(`Unsupported method: ${method}`)
      }
    },
    onSuccess: (data) => {
      options.onSuccess?.(data)
      queryClient.invalidateQueries({ queryKey: key })
    },
    onError: (error: Error) => {
      options.onError?.(error)
    },
  }) as any
}
