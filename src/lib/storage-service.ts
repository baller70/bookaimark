import { supabase } from '@/lib/supabase'

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GH_OWNER!
const GITHUB_REPO = process.env.NEXT_PUBLIC_GH_REPO!
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_GH_BRANCH ?? 'main'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN // server-side only

interface TriStoreOptions<T> {
  userId: string
  key: string // e.g. 'auto_processing'
  supabaseTable: string // e.g. 'linkpilot_settings'
  defaultValue: T
}

/**
 * Read the setting in priority: Supabase → GitHub → localStorage (client).
 */
export async function readTriStore<T = unknown>({
  userId,
  key,
  supabaseTable,
  defaultValue,
}: TriStoreOptions<T>): Promise<T> {
  // 1. Supabase
  const { data } = await supabase
    .from(supabaseTable)
    .select(key)
    .eq('user_id', userId)
    .single()

  if (data && data[key]) {
    // keep copies downstream
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(data[key]))
    }
    return data[key] as T
  }

  // 2. GitHub (server-only)
  if (GITHUB_TOKEN) {
    try {
      const path = `config/${key}/${userId}.json`
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3.raw',
          },
        },
      )
      if (res.ok) {
        const json = (await res.json()) as T
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(json))
        }
        // also hydrate Supabase asynchronously (fire-and-forget)
        supabase.from(supabaseTable).upsert({ user_id: userId, [key]: json })
        return json
      }
    } catch {}
  }

  // 3. localStorage (client only)
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  }

  return defaultValue
}

/**
 * Write to Supabase → GitHub → localStorage.
 */
export async function writeTriStore<T = unknown>({
  userId,
  key,
  supabaseTable,
  value,
}: TriStoreOptions<T> & { value: T }) {
  // Supabase
  await supabase.from(supabaseTable).upsert({ user_id: userId, [key]: value })

  // GitHub (server-side only)
  if (GITHUB_TOKEN) {
    const path = `config/${key}/${userId}.json`
    const content = Buffer.from(JSON.stringify(value, null, 2)).toString('base64')
    // try create or update file
    await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `chore: update ${key} for ${userId}`,
        content,
        branch: GITHUB_BRANCH,
      }),
    })
  }

  // localStorage
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
} 