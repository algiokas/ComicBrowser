export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// Server response envelopes seen across the API
export interface SuccessResponse { success: boolean }
export interface ChangesResponse { changes: number }

// Standardized request helpers: fetch -> res.json(). Callers own the
// success/changes check and any state updates.
export async function apiGet<T = any>(path: string): Promise<T> {
    const res = await fetch(`${apiBaseUrl}${path}`)
    return res.json()
}

export async function apiPostJson<T = any>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${apiBaseUrl}${path}`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: body != null ? JSON.stringify(body) : undefined
    })
    return res.json()
}

export async function apiPostRaw<T = any>(path: string, contentType: string, body: BodyInit): Promise<T> {
    const res = await fetch(`${apiBaseUrl}${path}`, {
        method: 'post',
        headers: { 'Content-Type': contentType },
        body
    })
    return res.json()
}

export async function apiDelete<T = any>(path: string): Promise<T> {
    const res = await fetch(`${apiBaseUrl}${path}`, {
        method: 'delete'
    })
    return res.json()
}
