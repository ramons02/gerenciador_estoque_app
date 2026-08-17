export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    let message = `Erro ao executar a requisicao (${response.status}).`
    try {
      const body = await response.json()
      if (typeof body.message === 'string' && body.message.length > 0) {
        message = body.message
      }
    } catch {
      // corpo nao JSON: mantem mensagem generica
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}