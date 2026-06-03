const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"

export async function api<T>(
  path: string,
  options: Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>
    token?: string
  } = {}
): Promise<T> {
  const { token, headers, ...requestOptions } = options
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      message?: string | string[]
    } | null
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message

    throw new Error(message ?? "Request failed")
  }

  return response.json() as Promise<T>
}
