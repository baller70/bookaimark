import { readTriStore, writeTriStore } from './storage-service'

export async function getUserSetting<T>(userId: string, key: string, defaultValue: T): Promise<T> {
  return readTriStore<T>({
    userId,
    key,
    supabaseTable: 'user_settings',
    defaultValue,
  })
}

export async function saveUserSetting<T>(userId: string, key: string, value: T) {
  return writeTriStore<T>({
    userId,
    key,
    supabaseTable: 'user_settings',
    defaultValue: value,
    value,
  })
}

// Oracle settings helpers
export async function getOracleSetting<T>(userId: string, category: string, defaultValue: T): Promise<T> {
  // Fetch the full settings object (may be empty)
  const allSettings = await readTriStore<Record<string, unknown>>({
    userId,
    key: 'settings',
    supabaseTable: 'oracle_settings',
    defaultValue: {},
  })
  // Return the requested category or default
  return (allSettings[category] as T) ?? defaultValue
}

export async function saveOracleSetting<T>(userId: string, category: string, value: T) {
  // Read existing to merge
  const allSettings = await readTriStore<Record<string, unknown>>({
    userId,
    key: 'settings',
    supabaseTable: 'oracle_settings',
    defaultValue: {},
  })
  const merged = { ...allSettings, [category]: value }
  await writeTriStore<Record<string, unknown>>({
    userId,
    key: 'settings',
    supabaseTable: 'oracle_settings',
    defaultValue: merged,
    value: merged,
  })
}

// General AI settings helpers (not just Oracle)
export async function getAISetting<T>(userId: string, category: string, defaultValue: T): Promise<T> {
  // Fetch the full settings object (may be empty)
  const allSettings = await readTriStore<Record<string, unknown>>({
    userId,
    key: 'settings',
    supabaseTable: 'ai_settings',
    defaultValue: {},
  })
  // Return the requested category or default
  return (allSettings[category] as T) ?? defaultValue
}

export async function saveAISetting<T>(userId: string, category: string, value: T) {
  // Read existing to merge
  const allSettings = await readTriStore<Record<string, unknown>>({
    userId,
    key: 'settings',
    supabaseTable: 'ai_settings',
    defaultValue: {},
  })
  const merged = { ...allSettings, [category]: value }
  
  // Write back the merged settings
  await writeTriStore({
    userId,
    key: 'settings',
    supabaseTable: 'ai_settings',
    value: merged,
    defaultValue: {},
  })
} 